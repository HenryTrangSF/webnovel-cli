const puppeteer = require('../../../node_modules/puppeteer');
const ghost = require('../../ghost/index');
const utilities = require('../../utilities');

exports.add = async function novel(URL) {

  // Launch the Chromium browser
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  const QU = "https://toc.qidianunderground.org/";

  // Sets up the necessary variables beforehand
  let click = false;
  let clickSelector;
  let waitSelector;
  let novelSelector;
  let novelRE;
  let chapterSelector;
  let chapterWait;
  let chapterTitleSelector;
  let chapterContentSelector;
  let RE;

  if (URL.indexOf('https://www.webnovel.com/') >= 0) {
    let click = true;
    let clickSelector = 'a[data-for=\"#contents\"]';
    let waitSelector = '.volume-item';
    let novelSelector = 'h2'
    let novelRE = /( <small>\w*<\/small>)/;
    let chapterSelector = '.volume-item a';
    let chapterWait = '.cha-words';
    let chapterTitleSelector = '.cha-tit h3';
    let chapterContentSelector = '.cha-words';
  }
  if (URL.indexOf('https://www.wuxiaworld.com/') >= 0) {
    let click = true;
    let clickSelector = 'a[href=\"#chapters\"';
    let waitSelector = '#chapters';
    let novelSelector = 'h2';
    let chapterSelector = '.chapter-item a'
    let chapterWait = '.footer'
    let chapterTitleSelector = '#chapter-outer h4';
    let chapterContentSelector = '#chapter-content';
  }

  // Go to the page URL and load the Table of Contents
  await Promise.all([
    page.waitForSelector(waitSelector),
    page.goto(URL)
  ]);
  await page.click(clickSelector);

  // Get the novel title
  novel = await page.evaluate((novelSelector, novelRE) => {
    if (novelRE != undefined) {
      return document.querySelector(novelSelector).innerHTML.replace(novelRE, '');
    }
    return document.querySelector(novelSelector.textContent);
  }, novelSelector, novelRE)

  // Fetch the links of all chapters
  chapters = await page.evaluate((chapterSelector) => {
    let chapterArray = document.querySelectorAll(chapterSelector);
    let arr = [];

    // Fetch only the free (non-premium chapters) for Webnovel
    if (window.location.href.indexOf('webnovel') >= 0) {
      Array.from(chapterArray).forEach(element => {
        if (element.children.length < 3) {
          arr.push('https:' + element.getAttribute('href'));
        }
      })

      return arr;
    }

    // Fetch every chapter for all other sites
    Array.from(chapterArray).forEach(element => {
      arr.push(element.getAttribute('href'));
    })
    
    return arr;
  }, chapterSelector);

  // Navigate to each page to scrape and publish to Ghost
  Array.from(chapters).forEach(element => {
    await Promise.all([
      page.waitForSelector(chapterWait),
      page.goto(element)
    ]);

    chapter = await page.evaluate((chapterTitleSelector, chapterContentSelector, RE) => {
      let title = document.querySelector(chapterTitleSelector).textContent;
      let content = document.querySelector(chapterContentSelector);

      // Cleans up the content by clearing out all attributes of all the elements in the chapter content
      Array.from(content.querySelectorAll('*')).forEach(element => {
        Array.from(element.getAttributeNames()).forEach(attribute => {
          element.removeAttribute(attribute);
        });
      });

      // If the content needs further cleaning, use Regular Expressions to clean up the content some more
      if (RE != undefined) {
        content.innerHTML = content.replace(RE, '');
      }

      let object = {
        title: title,
        content: content.innerHTML
      }

      return object
    }, chapterTitleSelector, chapterContentSelector, RE)

    ghost.post(novel, chapter.title, chapter.content);
  })

}