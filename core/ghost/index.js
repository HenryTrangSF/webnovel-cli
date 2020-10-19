require("dotenv").config();

const Ghost = require('../../node_modules/@tryghost/admin-api');
const novel = require('../add/index');
const utilities = require('../utilities');

const api = new Ghost({
    url: process.env.GHOST_API_URL,
    key: process.env.GHOST_ADMIN_API_KEY,
    version: 'v3'
});

exports.api = api;

exports.post = async function post(novel, title, content) {

    // Convert HTML into a mobiledoc readable format
    let mobiledoc = JSON.stringify ({
        version: '0.3.1',
        markups: [],
        atoms: [],
        cards: [['html', {cardName: 'html', html: content}]],
        sections: [[10, 0]]
    });

    // Chapter post object
    let post = {
        title: title,
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
            process.exit(1);
        })
    
    // Sleep for a certain amount of time
    // This is to prevent spam and to keep chapters in order
    await utilities.sleep(1000);
}

exports.delete = async function remove(slug) {

    let IDs = [];

    // Get all the post IDs of a tag
    await api.posts
        .browse({
            filter: 'tag:' + slug,
            limit: 'all'
        })
        .then(response => {
            for (let i = 0; i < response.length; i++) {
                IDs.push(response[i].id);
            }
        })
        .catch(error => {
            console.log(error);
            process.exit(1);
        })

    // Delete all the posts within the tag
    for (let i = 0; i < IDs.length; i++) {
        await api.posts
            .delete({id: IDs[i]})
            .catch(error => {
                console.log(error);
                process.exit(1);
            })
    }

    console.log("Posts have been successfully deleted.");
    process.exit(0);
}