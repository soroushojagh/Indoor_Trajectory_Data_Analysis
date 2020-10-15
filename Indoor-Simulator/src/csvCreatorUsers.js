const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const checkDirectory = require('../src/checkDirectory')

module.exports = function writeCsv(jsonArray) {

    checkDirectory('data/output-csv');

    const pathCsv = "data/output-csv/users.csv";

    const csvWriter = createCsvWriter({
        path: pathCsv,
        header: [
            {
                id: 'ID',
                title: 'Users'
            },
            {
                id: 'Status',
                title: 'HealthStatus'
            },
            {
                id: 'JobType',
                title: 'JobType'
            },
            {
                id: 'ActivityType',
                title: 'ActivityType'
            },
        ]
    });

    const data = jsonArray;

    csvWriter
        .writeRecords(data)
        .then(() => console.log("The CSV file was written successfully for the users.csv"));
}
