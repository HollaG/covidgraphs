var express = require('express');
var router = express.Router();
var fs = require('fs')
var CronJob = require("cron").CronJob
const util = require('util')

// Load Google Spreadsheet data
const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet('1RgZxXk-oD8xLlFRx3hcmiLaQpFoJJX6CfN0iI-Bc9H8');

var config = require("../config.json")



// Every 3am, update the locally-stored file
var job = new CronJob("00 00 03 * * *", async () => {
    console.log("Running job")
    var runTime = new Date().toDateString()
    await doc.useApiKey(config.apiKey)
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[2]; // or use doc.sheetsById[id]

    const rows = await sheet.getRows()

    var GoogleSpreadsheetData = []

    /* ------------------- Total Cases against Time ------------------- */
    const schema1 = [{
        "name": "Case Type", // each line
        "type": "string"


    }, {
        "name": "Case Numbers", //y
        "type": "number"
    }, {
        "name": "Time", // x
        "type": "date",
        "format": "%-d-%b-%y"
    }]

    var data1 = []

    /* ------------------- New Cases against Time ------------------- */
    const schema2 = [{
        "name": "Case Type", // each line
        "type": "string"


    }, {
        "name": "Case Numbers", //y
        "type": "number"
    }, {
        "name": "Time", // x
        "type": "date",
        "format": "%-d-%b-%y"
    }, {
        "name": "Total Cases",
        "type": "number"
    }]


    var data2 = []

    /* ------------------- Recoveries against Time ------------------- */
    const schema3 = [{
        "name": "Case Type", // each line
        "type": "string"
    }, {
        "name": "Case Numbers", //y
        "type": "number"
    }, {
        "name": "Time", // x
        "type": "date",
        "format": "%-d-%b-%y"
    }]


    var data3 = []

    /* ------------------- Total cases against Time (logarithmic) ------------------- */
    const schema4 = [{
        "name": "Total Cases",
        "type": "number",


    }, {
        "name": "Time", // x
        "type": "date",
        "format": "%-d-%b-%y"
    }]
    var data4 = []
    /* ------------------- New cases against Total cases (logarithmic) ------------------- */
    var category5 = []
    var data5 = []

    rows.forEach(row => {
        GoogleSpreadsheetData.push({
            "Date": row["Date"],
            "New local dormitory cases (per day)": row["New local dormitory cases (per day)"],
            "New local work permit holder cases (per day)": row["New local work permit holder cases (per day)"],
            "New local community cases (per day)": row["New local community cases (per day)"],
            "New local cases (per day)": row["New local cases (per day)"],
            "New imported cases(per day)": row["New imported cases(per day)"],
            "New cases (per day)": row["New cases (per day)"],
            "Total dormitory cases": row["Total dormitory cases"],
            "Total work permit holder cases": row["Total work permit holder cases"],
            "Total local community cases": row["Total local community cases"],
            "Total local": row["Total local"],
            "Total imported": row["Total imported"],
            "Total cases": row["Total cases"],
            "Recovered (per day)": row["Recovered (per day)"],
            "Total recovered": row["Total recovered"],
            "# ICU (on the day)": row["# ICU (on the day)"],
            "# still in hospital": row["# still in hospital"],
        })
        data1.push(
            [
                "Imported Cases",
                row['Total imported'],
                row['Date']
            ],
            [
                "Local Community Cases",
                row['Total local community cases'],
                row['Date']
            ],
            [
                "Dormitory Cases",
                row['Total dormitory cases'],
                row['Date']
            ],
            [
                "Work Pass Holder Cases",
                row['Total work permit holder cases'],
                row['Date']
            ])




        data2.push(
            [
                "New Imported Cases",
                row['New imported cases(per day)'],
                row["Date"],
                // row["Total cases"],
            ],
            [
                "New Local Community Cases",
                row['New local community cases (per day)'],
                row["Date"],
                // row["Total cases"],
            ],
            [
                "New Dormitory Cases",
                row['New local dormitory cases (per day)'],
                row['Date'],
                // row["Total cases"],
            ],
            [
                "New Workpass Holder Cases",
                row['New local work permit holder cases (per day)'],
                row["Date"],
                // row["Total cases"],
            ],
            [
                "Total Cases",
                undefined,
                row["Date"],
                row["Total cases"],
            ])


        data3.push(
            [
                "Recovered Cases",
                row['Total recovered'],
                row["Date"]
            ],
            [
                "Total Cases",
                row["Total cases"],
                row['Date']
            ])
        data4.push(
            [
                row["Total cases"],
                row["Date"]
            ]
        )
        category5.push({
            x: row["Total cases"],
            label: row["Total cases"]
        })
        data5.push(

            {
                x: row["Total cases"],
                y: row["New cases (per day)"]
            }

        )
    })


    var writeObject = {
        rows: GoogleSpreadsheetData,
        schema1: schema1,
        data1: data1,
        schema2: schema2,
        data2: data2,
        schema3: schema3,
        data3: data3,
        schema4: schema4,
        data4: data4,
        category5: category5,
        data5: data5,
        runTime: runTime
    }

    var writeableObject = JSON.stringify(writeObject)
    fs.writeFile("data.json", writeableObject, 'utf8', (err) => {
        if (err) console.log(err)
        console.log("file written")
    })




})
job.start()





// Home Page
router.get("/", async (req, res, next) => {

    var file = fs.readFileSync("data.json")
    var readableData = JSON.parse(file)



    res.render("main", {
        rows: readableData.rows,
        data1: readableData.data1,
        schema1: readableData.schema1,
        data2: readableData.data2,
        schema2: readableData.schema2,
        // dataSource2: dataSource2,
        data3: readableData.data3,
        schema3: readableData.schema3,
        data4: readableData.data4,
        schema4: readableData.schema4,
        category5: readableData.category5,
        data5: readableData.data5,
        date: readableData.runTime,
        cookie: req.cookies,

        stringify: require('js-stringify'),
        HtmlTableColumnHider: require('html-table-column-hider')

    })



})


// Create your own graph
router.get("/create", async (req, res, next) => {
    var file = fs.readFileSync("data.json")
    var readableData = JSON.parse(file)
    
    

    res.render('create', {
        rows: readableData.rows,
        stringify: require("js-stringify"),
        params: req.query,
        cookie: req.cookies,
        
    })



})

router.get("*", (req, res, next) => {
    res.redirect("/")
})


module.exports = router;

