const axios = require("axios");
const moment = require('./utils/moment');

const fs = require("fs");
const path = require("path");

function generateDateArray(startDate, endDate, format = 'YYYY-MM-DD') {
    const start = moment(startDate);
    const end = moment(endDate);
    const dates = [];

    while (start.isSameOrBefore(end)) {
        dates.push(start.format(format));
        start.add(1, 'day'); // Increment by one day
    }

    return dates;
}

(async () => {
    try {
        const pLimit = (await import("p-limit")).default

        const dates = generateDateArray(moment().startOf("year").format(), moment().startOf("year").add(20, "years").endOf("year").format())

        const limit = pLimit(10);

        const promises = dates.map(date =>
            limit(() =>
                axios.get(`https://api-liturgia.edicoescnbb.com.br/contents/in/date/${date}`)
                    .then(res => {
                        console.log(date)

                        return res.data
                    })
                    .catch(err => {
                        console.log(err.message);

                        return null;
                    })
            )
        )

        let cnbbData = await Promise.allSettled(promises)

        cnbbData = cnbbData.filter(({ status }) => status === "fulfilled").map(cnbbData => cnbbData.value.content)

        fs.writeFileSync(path.join(__dirname, "../data/dates.json"), JSON.stringify(cnbbData, null, 4), { encoding: "utf-8" });
    } catch (error) {
        console.log(error);
    }
})();