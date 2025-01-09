const cheerio = require("cheerio");
const dates = require("../data/dates.json");

let colors = Object.keys(Object.fromEntries(dates.map(({ color }) => [color])))

let colors1 = colors.map((color_) => [color_, dates.find(({ color }) => color == color_).date])

let colors2 = dates.map(({ details, date }) => {
    const $ = cheerio.load(details)

    return $("img").attr('src').match(/estolas\/(.*?).png/gm)[0].split("/")[1].split(".png")[0]
})

colors2 = Object.keys(Object.fromEntries(colors2.map((color) => [color])))

colors2 = colors2.map((color_) => [color_, dates.find(({ color }) => color == color_).date])


console.log(colors1, colors2)

/* 

[ 'branco', '01/01/2025' ],
  [ 'verde', '14/01/2025' ],
  [ 'vermelho', '20/01/2025' ],
  [ 'roxo', '05/03/2025' ],
  [ 'rosa', '30/03/2025' ]
]
*/