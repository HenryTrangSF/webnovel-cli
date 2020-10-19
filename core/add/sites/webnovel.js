const puppeteer = require('../../../node_modules/puppeteer');
const ghost = require('../../ghost/index');
const utilities = require('../../utilities');

exports.add = async function webnovel(URL) {

    // Launch the Chromium browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Go to the URL and load the Table of Contents
    await page.goto(URL);
    await page.click("a[data-for=\"#contents\"]");
    await page.waitForSelector('.volume-item');

    // Get the title of the Novel
    novel = await page.evaluate(() => {

        let h2 = document.getElementsByTagName('h2');
        let re = /\s$/
        let title = h2[0].firstChild.textContent.replace(re, '');

        return title;
    });

    // Fetch the links of all free chapters
    let chapters = await page.evaluate(() => {

        let list = document.querySelectorAll('.volume-item a');
        // Initialize the links array
        let links = [];

        // Push all free chapters into the links array
        for (let i = 0; i < list.length; i++) {
            const url = list[i].getAttribute('href');
            
            if (list[i].children.length < 3) {
                links.push('https:' + url);
            }
            else {
                // Stops the loop on the first premium chapter
                break;
            }
        }

        return links;
    });

    for (let i = 0; i < chapters.length; i++) {
        
        // Navigate to the ith page of the novel
        await Promise.all([
            page.waitForSelector('.cha-words'),
            page.goto(chapters[i])
        ]);

        chapter = await page.evaluate(() => {
            let re = /^\s*|<div\sclass.*">|<i\sclass.*">\d*<\/i>|<\/div>|<a\shref=.*>\s.*\s.*\s.*\s.*|<\/a>|/gm;
            let title = document.querySelector('h3.dib').textContent;
            let rootHTML = document.querySelector('.cha-words');
            let HTML = rootHTML.innerHTML.replace(re, '');

            let array = [{
                title: title,
                content: HTML
            }];

            return array;
        });

        // Publish the chapter
        ghost.post(novel);

        // Sleep for 1 second before posting the next chapter
        utilities.sleep(1000);
    }

    console.log("Novel has been successfully added");
    process.exit(0);
}