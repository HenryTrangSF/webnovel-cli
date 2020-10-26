const webnovel = require('./sites/webnovel');
const wuxiaworld = require('./sites/wuxiaworld');

let URL = process.argv[2];

(async () => {
    // Ensures that the user puts in only one argument
    if (process.argv.length > 3) {
        console.log("Usage: npm add \'URL\'");
        process.exit(1);
    }

    if (URL.indexOf("https") > -1) {
        if (URL.indexOf("webnovel") > -1) {
            webnovel.add(URL);
        }
        if (URL.indexOf("wuxiaworld") > -1) {
            wuxiaworld.add(URL);
        }
    }
    // TO DO
    /* else {
        console.log("Please include a proper URL in the argument");
        process.exit(1);
    } */
})();