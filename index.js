// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News newest page
  await page.goto("https://news.ycombinator.com/newest");

  // collect timestamps of the first 100 articles
  const timestamps = [];
  while (timestamps.length < 100) {
    // get all age elements on current page (they contain the exact timestamp in the title attribute)
    const ageElements = await page.locator('.age a[title]').all();

    // extract only the newly loaded ones (starting from the current count)
    for (let i = timestamps.length; i < ageElements.length; i++) {
      const title = await ageElements[i].getAttribute('title');
      if (title) timestamps.push(title);
      if (timestamps.length >= 100) break;
    }

    // if we still need more, click the "More" link and wait for new content
    if (timestamps.length < 100) {
      await page.click('.morelink');
      await page.waitForLoadState('networkidle');
    }
  }

  // take only the first 100 (safety check)
  const first100 = timestamps.slice(0, 100);

  // validate that they are sorted from newest to oldest (descending order)
  let sorted = true;
  for (let i = 0; i < first100.length - 1; i++) {
    // ISO 8601 strings are lexicographically comparable: newer dates have larger strings
    if (first100[i] < first100[i + 1]) {
      console.error(`Out of order at index ${i}: ${first100[i]} -> ${first100[i + 1]}`);
      sorted = false;
      break;
    }
  }

  if (sorted) {
    console.log('✅ The first 100 articles are correctly sorted from newest to oldest.');
  } else {
    throw new Error('❌ Sorting validation failed.');
  }

  // close browser
  await browser.close();
}

(async () => {
  try {
    await sortHackerNewsArticles();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
