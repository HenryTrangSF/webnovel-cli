# Webnovel CLI

A command line interface for scraping webnovels. Currently only supports Webnovel and Wuxiaworld.

## Requirements

- A Ghost Blog with admin privileges (Used to grab API key)
- Node 12  or later
- An OS that can run Chromium

## Installing

Simply run `npm install` to install all the relevant packages required to run webnovel-cli. Npm will do the hard work

## Usage

### Adding novels to your Ghost blog

Use `npm run add URL` replacing `URL` with the link of the novel that you want to scrape. I.e. `npm run add https://www.webnovel.com/book/true-martial-world_7834185605001405` will scrape the novel True Martial World off Webnovel. Every successful post will return a JSON back.

### Deleting novels off your Ghost blog

Use `npm run delete SLUG` replacing `SLUG` with the tag slug of the novel you want to delete. There will be no response from the server. Once all novels have been deleted, the console will tell you that all novels have been successfully deleted.