const { compress, decompress } = require('compress-json');
const fs = require("fs");
const path = require("path");

const dates = require("../data/dates.json");

let compressed = compress(dates);

fs.writeFileSync(path.join(__dirname, "../data/dates-minified.json"), JSON.stringify(compressed))