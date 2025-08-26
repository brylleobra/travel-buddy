import { chromium } from 'playwright';
import robotsParser from 'robots-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SourceRef } from '@tripsmith/db';

const DEFAULT_SITES = (process.env.SCRAPER_SITES || '').split(',').filter(Boolean);
const USER_AGENT = process.env.SCRAPER_USER_AGENT || 'TripSmithBot/1.0';

async function allowed(url) {
  try {
    const { origin } = new URL(url);
    const robotsUrl = `${origin}/robots.txt`;
    const { data } = await axios.get(robotsUrl, { timeout: 8000 });
    const robots = robotsParser(robotsUrl, data);
    return robots.isAllowed(url, USER_AGENT);
  } catch {
    return false;
  }
}

export async function runDailyScrape() {
  const sites = DEFAULT_SITES.length ? DEFAULT_SITES : [
    'https://thepointsguy.com',
    'https://www.nomadicmatt.com',
    'https://www.timeout.com',
    'https://www.klook.com/blog',
    'https://www.scottscheapflights.com'
  ];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: USER_AGENT });

  for (const site of sites) {
    try {
      if (!(await allowed(site))) { console.log('[scrape] Disallowed root', site); continue; }
      await page.goto(site, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const html = await page.content();
      const $ = cheerio.load(html);

      const links = new Set();
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || href.startsWith('#')) return;
        try {
          const abs = href.startsWith('http') ? href : new URL(href, site).href;
          if (/deal|review|things-to-do|where-to-stay|hotel|eat|food|restaurant/i.test(abs)) links.add(abs);
        } catch {}
      });

      for (const url of links) {
        try {
          if (!(await allowed(url))) continue;
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
          const article = await page.content();
          const $$ = cheerio.load(article);

          const title = $$('meta[property="og:title"]').attr('content') || $$('title').text().trim();
          const text  = $$('article').text().trim() || $$('.post').text().trim() || $$('body').text().trim();
          const siteName = new URL(url).hostname;

          // Extract price & discount mentions
          const findings = [];
          const priceRegex = /\$ ?(\d{2,5})(?:\s?(?:roundtrip|rt|night|one-way))?/gi;
          const discountRegex = /(\d{1,2})%\s*(?:off|discount|sale)/gi;

          let m;
          while ((m = priceRegex.exec(text))) findings.push({ type: 'price', value: Number(m[1]), currency: 'USD', context: 'article' });
          while ((m = discountRegex.exec(text))) findings.push({ type: 'discount', value: Number(m[1]), currency: 'USD', context: 'article' });

          await SourceRef.findOneAndUpdate(
            { url },
            {
              $set: {
                title: title || url,
                site: siteName,
                scrapedAt: new Date(),
                priceMentions: findings
              },
              $setOnInsert: { kind: 'REVIEW', quotes: [] }
            },
            { upsert: true, new: true }
          );
        } catch (e) {
          console.error('[scrape] article error', url, e.message);
        }
      }
    } catch (e) {
      console.error('[scrape] site error', site, e.message);
    }
  }

  await browser.close();
}
