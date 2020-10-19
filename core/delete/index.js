const ghost = require('../ghost/index');

let tag = process.argv[2];

(async () => {
    if (process.argv.length > 3) {
        console.log("Usage: npm run delete \"tag-slug\"");
        process.exit(1);
    }
    else {
        ghost.delete(tag);
    }
})();