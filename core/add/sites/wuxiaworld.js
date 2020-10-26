const puppeteer = require('../../../node_modules/puppeteer');
const ghost = require('../../ghost/index');
const utilities = require('../../utilities');

exports.add = async function wuxiaworld(URL) {

    // Launch the Chromium browser
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    // Go to the URL and load the chapters
    await page.goto(URL);
    await page.click('a[href=\"#chapters\"');
    await page.waitForSelector('#chapters');

    // Get the title of the Novel
    novel = await page.evaluate(() => {
        return document.getElementsByTagName('h2')[0].textContent;
    })

    // Fetch all the chpater links
    chapters = await page.evaluate(() => {
        // Get every chapter element
        let list = document.getElementsByClassName('chapter-item');
        // Initialize the links array
        let links = [];

        // Push all the chapters into the links array
        for (let i = 0; i < list.length; i++) {
            const element = list[i].querySelector('a');
            const URL = 'https://wuxiaworld.com'
            
            let URI = element.getAttribute('href');
            links.push(URL + URI);
        }

        return links;
    });

    // Navigate to every chapter and publish the chapter to Ghost
    for (let i = 0; i < chapters.length; i++) {
        const element = chapters[i];
        
        // Navigate to the ith page of the novel
        await Promise.all([
            page.waitForSelector('#chapter-outer'),
            page.goto(element)
        ]);

        // Get the chapter information from the page
        let chapter = await page.evaluate(() => {
            let re = /<script>[\s\S]*<\/script>|<span\sstyle="[\w\s:(),;-]*">|<span>|<\/span>|\sdir="ltr"|<a\shref="[\/\w-]*" class="chapter-nav">[\n\w\s]*<\/a>/gm;
            let title = document.querySelector('#chapter-outer').getElementsByTagName('h4')[0].textContent;
            let rootHTML = document.querySelector('#chapter-content');
            let HTML = rootHTML.innerHTML.replace(re, '');

            let array = [{
                title: title,
                content: HTML
            }];

            return array;
        });

        // Publish the chapter onto Ghost
        await ghost.post(novel, chapter[0].title, chapter[0].content);
    }

    console.log("Novel has been successfully added");
    process.exit(0);
}