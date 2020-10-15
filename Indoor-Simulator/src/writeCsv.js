const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const checkDirectory = require('../src/checkDirectory')

module.exports = function writeCsv(jsonArray, userId) {

    checkDirectory('data/output-csv');

    const pathCsv = "data/output-csv/u" + userId + ".csv";

    const csvWriter = createCsvWriter({
        path: pathCsv,
        header: [
            {
                id: 'ID',
                title: 'UserID'
            },
            {
                id: 'Status',
                title: 'HealthStatus'
            },
            {
                id: 'BeaconCellName',
                title: 'BeaconCellName'
            },
            {
                id: 'Duration',
                title: 'Duration'
            },
            {
                id: 'Time',
                title: 'EntranceTime'
            },
            {
                id: 'Exit_Date',
                title: 'ExitTime'
            },
            {
                id: 'GPS_Time',
                title: 'EntranceGPSTime'
            },
            {
                id: 'GPS_Exit_Time',
                title: 'ExitGPSTime'
            },
            {
                id: 'BeaconLatitude',
                title: 'BeaconLatitude'
            },
            {
                id: 'BeaconLongitude',
                title: 'BeaconLongitude'
            },
            {
                id: 'BeaconAltitude',
                title: 'BeaconAltitude'
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
        .then(() => console.log("The JSON file was written successfully for the user " + userId));
}
