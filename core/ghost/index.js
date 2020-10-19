require("dotenv").config();

const Ghost = require('../../node_modules/@tryghost/admin-api');
const novel = require('../add/index');

const api = new Ghost({
    url: process.env.GHOST_API_URL,
    key: process.env.GHOST_ADMIN_API_KEY,
    version: 'v3'
});

exports.post = async function post(novel) {

    // Convert HTML into a mobiledoc readable format
    let mobiledoc = JSON.stringify ({
        version: '0.3.1',
        markups: [],
        atoms: [],
        cards: [['html', {cardName: 'html', html: chapter[0].content}]],
        sections: [[10, 0]]
    });

    // Chapter post object
    let post = {
        title: chapter[0].title,
        mobiledoc: mobiledoc,
        tags: [novel],
        status: 'published'
    }

    // Publish chapters to Ghost
    await api.posts
        .add(post)
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            console.log(error);
        })
}