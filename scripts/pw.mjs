#!/usr/bin/env node
/**
 * Playwright helper for interacting with the Wails dev app.
 *
 * Usage:
 *   node scripts/pw.mjs screenshot [filename]
 *   node scripts/pw.mjs click <selector>
 *   node scripts/pw.mjs text <selector>
 *   node scripts/pw.mjs fill <selector> <value>
 *   node scripts/pw.mjs eval <js-expression>
 *   node scripts/pw.mjs html [selector]
 *   node scripts/pw.mjs wait <selector> [timeout-ms]
 *   node scripts/pw.mjs console [duration-ms]
 *   node scripts/pw.mjs navigate <path>
 */

import { chromium } from '@playwright/test';

const APP_URL = process.env.PW_URL || 'http://localhost:34115';
const SCREENSHOT_DIR = '/tmp/pw-screenshots';

const [,, cmd, ...args] = process.argv;

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    logs.push(`[error] ${err.message}`);
  });

  try {
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.error(`Failed to connect to ${APP_URL}: ${e.message}`);
    console.error('Is the Wails dev server running? (yarn dev:desktop)');
    await browser.close();
    process.exit(1);
  }

  try {
    switch (cmd) {
      case 'screenshot': {
        const { mkdirSync } = await import('fs');
        mkdirSync(SCREENSHOT_DIR, { recursive: true });
        const name = args[0] || `screen-${Date.now()}`;
        const path = `${SCREENSHOT_DIR}/${name}.png`;
        await page.screenshot({ path, fullPage: true });
        console.log(path);
        break;
      }

      case 'click': {
        const selector = args[0];
        if (!selector) throw new Error('Usage: click <selector>');
        await page.click(selector, { timeout: 5000 });
        console.log(`Clicked: ${selector}`);
        break;
      }

      case 'text': {
        const selector = args[0];
        if (!selector) throw new Error('Usage: text <selector>');
        const text = await page.textContent(selector, { timeout: 5000 });
        console.log(text);
        break;
      }

      case 'fill': {
        const [selector, ...valueParts] = args;
        const value = valueParts.join(' ');
        if (!selector || !value) throw new Error('Usage: fill <selector> <value>');
        await page.fill(selector, value, { timeout: 5000 });
        console.log(`Filled ${selector} with: ${value}`);
        break;
      }

      case 'eval': {
        const expr = args.join(' ');
        if (!expr) throw new Error('Usage: eval <js-expression>');
        const result = await page.evaluate(expr);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'html': {
        const selector = args[0] || 'body';
        const html = await page.innerHTML(selector, { timeout: 5000 });
        console.log(html);
        break;
      }

      case 'wait': {
        const selector = args[0];
        const timeout = parseInt(args[1]) || 10000;
        if (!selector) throw new Error('Usage: wait <selector> [timeout-ms]');
        await page.waitForSelector(selector, { timeout });
        console.log(`Found: ${selector}`);
        break;
      }

      case 'console': {
        const duration = parseInt(args[0]) || 5000;
        await page.waitForTimeout(duration);
        console.log(logs.join('\n'));
        break;
      }

      case 'navigate': {
        const path = args[0] || '/';
        await page.goto(`${APP_URL}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
        const { mkdirSync } = await import('fs');
        mkdirSync(SCREENSHOT_DIR, { recursive: true });
        const screenshotPath = `${SCREENSHOT_DIR}/navigate-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(screenshotPath);
        break;
      }

      default:
        console.error('Commands: screenshot, click, text, fill, eval, html, wait, console, navigate');
        process.exit(1);
    }
  } finally {
    if (logs.length > 0 && cmd !== 'console') {
      console.error('--- Console logs ---');
      console.error(logs.join('\n'));
    }
    await browser.close();
  }
}

run().catch(e => {
  console.error(e.message);
  process.exit(1);
});
