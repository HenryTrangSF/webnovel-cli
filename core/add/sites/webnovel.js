const puppeteer = require('../../../node_modules/puppeteer');
const ghost = require('../../ghost/index');
const utilities = require('../../utilities');

exports.add = async function webnovel(URL) {

    // Launch the Chromium browser
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    const QU = "https://toc.qidianunderground.org/";

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

        let chapter = await page.evaluate(() => {
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
        // await ghost.post(novel);
        ghost.post(novel, chapter[0].title, chapter[0].content);
    }

    // If the novel is on Qidian Underground to search for the novel
    await page.goto(QU);
    await page.waitForSelector('#Z');

    // Checks to see whether or not the novel is on Qiduan Underground
    check = await page.evaluate((novel) => {
        let list = document.getElementsByClassName('mb-3');
        let index = -1;
        
        // Searches for the novel within Qidian Underground
        for (let i = 0; i < list.length; i++) {
            if (list[i].textContent.indexOf(novel) > -1) {
                index = i;
                break;
            }
        }

        // If the novel is found, get all the chapters
        let links = [];

        // Clicks on the button to activate the chapters
        if (index > -1) {
            let cursor = list[index];
            // Clicks the button to view the chapters
            cursor.getElementsByTagName('button')[0].click();
            index++;
        }

        return index;
    }, novel);

    if (check == -1) {
        console.log("Novel was not found on Qidian Underground, posting has been completed.");
        process.exit(0);
    }

    // Quick pause to let the DOM load the chapters
    await utilities.sleep(1000);
    underground = await page.evaluate(() => {
        let novel = document.getElementsByClassName('mb-3')[0];
        let url = novel.getElementsByTagName('a');
        let links = [];

        for (let i = 0; i < url.length; i++) {
            links.push(url[i].getAttribute('href'));
        }

        return links;
    })

    // Go to all the links in Qidian Underground to add the chapters
    for (let i = 0; i < underground.length; i++) {
        await page.goto(underground[i]);
        await page.waitForSelector('.well');

        // Get all the chapters within the webpage to post
        chapters = await page.evaluate(() => {
            let selector = '.input-group.text-justify.center-block.col-md-8.col-md-offset-2 > .well';
            let re = /<br>|<h2\sclass.*>.*<\/h2>/gm;
            let title = document.querySelectorAll(selector + ' > h2.text-center');
            let HTML = document.querySelectorAll(selector);
            let array = [];

            for (let i = 0; i < title.length; i++) {
                let content = HTML[i].innerHTML.replace(re, '');
                array[i] = {
                    title: title[i].textContent,
                    content: content
                }
            }

            return array;
        })

        // Post all chapters in the chapters array
        for (let j = 0; j < chapters.length; j++) {
            await ghost.post(novel, chapters[j].title, chapters[j].content);
        }
    }


    // console.log("Novel has been successfully added");
    // process.exit(0);
}