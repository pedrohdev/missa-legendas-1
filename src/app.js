const express = require("express");
const cors = require("cors");
const path = require("path");
const moment = require("./utils/moment");
const { compress, decompress } = require('compress-json');

let dates = require("../data/dates-minified.json");

dates = decompress(dates)

console.log(dates)

const cheerio = require("cheerio");
const colors = require("./utils/colors");
const hexToRgba = require("hex-to-rgba");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "./public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

/* function natalToAdvento(string) {
    return string//.replace(/natal/gmi, "Advento")
}
 */

function quebrarString(texto, limite) {
    const palavras = texto.split(' ');
    let linha = '';
    const resultado = [];

    palavras.forEach(palavra => {
        if ((linha + palavra).length > limite) {
            resultado.push(linha.trim());
            linha = '';
        }
        linha += palavra + ' ';
    });

    if (linha) resultado.push(linha.trim());
    return resultado.join('<br>');
}

app.get("/", async (req, res) => {
    try {

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: error.message })
    }
    //2025-02-03
    // tem cores diferentes

    let { title, date: _date, color, hour } = req.query;

    const acDate = moment(_date ? String(_date).trim() : undefined, _date ? "DD/MM/YYYY" : undefined)
    const __date = acDate
    const nextDate = moment(__date.format()).add(1, "day")

    try {
        hour = hour ? Number(hour) : Number(moment().format("HH"))

    } catch (error) {
        console.log(error)
    }

    const nextDay = dates.find(({ date }) => nextDate.format("YYYY-MM-DD") === date)

    const $next = cheerio.load(nextDay.details)
    or
    let date = dates.find(({ date }) => acDate.fmat("YYYY-MM-DD") === date)

    if (
        (nextDate.format('ddd') == "Sun" ||
            $next('div[style*="font-size: 26px"]').text().toLowerCase().includes("solenidade")) && hour > 15) {
        date = nextDay
    }

    //[ 'branco', 'verde', 'vermelho', 'roxo', 'rosa' ]
    const $ = cheerio.load(date.details)

    const $1 = cheerio.load(date.leituras)
    let leituras = []
    let leitura = "";

    $1("div").map((i, el) => {
        if ($(el).text().trim().toLowerCase() != "leituras:") {
            leituras.push($(el).text().trim())
        }
    })

    leituras = leituras.filter(val => val.trim())
    let secondLeituraErr = false;


    if (title.toLowerCase().includes("leitura")) {
        if (title.toLowerCase().includes("1") || title.toLowerCase().includes("primeir")) {
            leitura = leituras[0]
        }

        if ((title.toLowerCase().includes("2") || title.toLowerCase().includes("segund")) && leituras.length == 4) {
            leitura = leituras[2]
        }

        if ((title.toLowerCase().includes("2") || title.toLowerCase().includes("segund")) && leituras.length == 3) {
            secondLeituraErr = true
        }
    }

    if (title.toLowerCase().includes("salmo")) {
        leitura = leituras[1]
    }

    if (title.toLowerCase().includes("evangelho")) {
        leitura = leituras[leituras.length - 1]
    }


    const extendedDate = $('div[style*="font-size: 12px"]').text()

    const color1 = $("img").attr('src').match(/estolas\/(.*?).png/gm)[0].split("/")[1].split(".png")[0]

    const data = {
        leitura,
        date: acDate.format("DD/MM/YYYY"),
        season: date.title,
        color2: color === "preto" ? '' : (color1 !== date.color ? date.color : ''),
        color: color === "preto" ? 'preto' : color1,
        extendedDate,
        day: {
            another: $('div[style*="font-size: 20px"]').text(),
            completed: $('div[style*="font-size: 26px"]').text(),
            simplified: quebrarString($('div[style*="font-size: 26px"] b').text(), 30)
        }
    }


    if (secondLeituraErr) {
        res.render("index");
    } else {
        res.render("card", { ...data, title: title ? capitalizeFirstLetter(String(title).trim()) : "", colors, hexToRgba })
    }
})

app.listen(process.env.PORT || 8500, () => console.log(`Servidor rodando em http://localhost:${process.env.PORT || 8500}`))