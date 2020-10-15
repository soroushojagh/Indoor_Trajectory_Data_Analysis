#!/usr/bin/env node

const fs = require('fs');

const yargs = require("yargs");
const inputData = require('../data/beacons');
const randomNumber = require('../src/randomNumber');
const nRandomNumber = require('../src/nRandomNumbers');
const writeCsv = require('../src/writeCsv')
const csvCreatorUsers = require('../src/csvCreatorUsers')
const gpsTime = require('gps-time');
const moment = require('moment');
const checkDirectory = require('../src/checkDirectory');

const COVID19Users = require('../data/output-json/covidUsers')
const cleaningStaffUsers = require('../data/output-json/cleaningUsers')


const options = yargs
    .usage("Usage: -n <name>")
    .option("n", {
        alias: "userCount",
        describe: "The number of users you are willing to generate their movement indoor trajectories",
        type: "number",
        default: 20000
    })

    .option("st", {
        alias: "startTime",
        describe: "The time you are going to start the simulation",
        type: "string",
        default: "2020-07-24T23:38:14.461Z"
    })

    .option("et", {
        alias: "endTime",
        describe: "The time you are going to stop the simulation",
        type: "string",
        // default: "2020-07-25T01:38:14.461Z"
        default: "2020-07-25T03:38:14.461Z"
    })

    .option("mt", {
        alias: "maximumTime",
        describe: "The maximum of time duration for each stay point",
        type: "number",
        default: 1200
    })

    .option("mnt", {
        alias: "minimumTime",
        describe: "The minimum of time duration for each stay point",
        type: "number",
        default: 20
    })

    .argv;


// // Generating a list of random 2000 cleaning users and 4000 COVID19 users out of 20,0000 users
// // Save data as a json in the data folder
// let covidUsers = [];
// let cleaningUsers = [];
//
// let prevCount = 0;
// let count;
//
// for (let i = 1; i <= 4; i++) {
//     let min, max, result;
//     if (i === 1) {
//         min = 1;
//         max = 20;
//     } else {
//         min = 20 * (Math.pow(10, (i - 2))) + 1;
//         max = 20 * (Math.pow(10, (i - 1)));
//     }
//     count = max * (3 / 10) - prevCount;
//
//
//     result = nRandomNumber(min, max, count)
//
//     prevCount = max * (3 / 10)
//
//     let boundary = ((result.length) - (2 * Math.pow(10, i - 1))) + cleaningUsers.length;
//
//     for (let j = 0; j < result.length; j++) {
//
//         if (j < boundary) {
//             covidUsers.push(result[j])
//         } else {
//             cleaningUsers.push(result[j])
//         }
//     }
//
// }
// console.log("Number of COVID19 users:",covidUsers.length)
// console.log("Number of Cleaning_Staff users:",cleaningUsers.length)
//
// let covidUsersJSON = JSON.stringify(covidUsers);
// let cleaningUsersJSON = JSON.stringify(cleaningUsers);
// fs.writeFileSync("data/output-json/covidUsers.json", covidUsersJSON);
// fs.writeFileSync("data/output-json/cleaningUsers.json", cleaningUsersJSON);

let usersArray = [];

// for (let i = 1; i <= options.userCount; i++) {

let startDate = new Date(options.startTime);
const finalDate = new Date(options.endTime);

(async () => {
    for (let i = 1; i <= options.userCount; i++) {

        let healthStatusUser = "HEALTHY";
        let jobTypeUser = "Others";

        COVID19Users.find(user => {
            if(user  === i)
            {
                healthStatusUser = "COVID19";
            }
        });

        cleaningStaffUsers.find(user => {
            if(user  === i)
            {
                jobTypeUser = "Cleaning_Staff";
            }
        });

        usersArray.push({
            "ID": i,
            "Status": healthStatusUser,
            "JobType" : jobTypeUser,
            "ActivityType" : "Working"
        })

        checkDirectory('data/output-json')

        const path = "data/output-json/u" + i + ".json";
        let endDate = new Date(startDate.valueOf());
        let userTrajectory = [];
        let properties = {};
        let userStayPointsArray = [];
        const nodeNumber = randomNumber(0, inputData.features.length);
        const startNodeName = inputData.features[nodeNumber].properties.name;
        properties['ID'] = i;
        properties['Status'] = healthStatusUser;
        properties['BeaconCellName'] = startNodeName;
        userStayPointsArray.push(startNodeName);

        let stayTime = randomNumber(20, 1200);
        properties['Duration'] = stayTime;
        properties['Time'] = moment(endDate).toISOString();
        console.log(properties['Time'])
        properties['Exit_Date'] = moment(endDate.setSeconds(endDate.getSeconds() + properties['Duration'])).toISOString();


        properties['GPS_Time'] = gpsTime.toUnixMS(new Date(properties['Time']).getTime());
        properties['GPS_Exit_Time'] = gpsTime.toUnixMS(new Date(properties['Exit_Date']).getTime());
        properties['BeaconLatitude'] = inputData.features[nodeNumber].geometry.coordinates[1];
        properties['BeaconLongitude'] = inputData.features[nodeNumber].geometry.coordinates[0];
        properties['BeaconAltitude'] = 8.6;
        properties['JobType'] = jobTypeUser;
        properties['ActivityType'] = "Working";
        userTrajectory.push(properties);


        while (endDate < finalDate) {

            let nextProperties = {};
            let previousStayPoint = userStayPointsArray[userStayPointsArray.length - 1];
            let optionsToGo = [];
            inputData.features.forEach(beacon => {
                if (beacon.properties.name === previousStayPoint) {
                    optionsToGo = beacon.properties.connections
                }
            })

            optionsToGo.forEach((option, index) => {
                userStayPointsArray.forEach(stayPoint => {
                    if (stayPoint === option && optionsToGo.length > 2) {
                        optionsToGo.splice(index, 1);
                    }
                })
            })

            const nextPointNumber = randomNumber(0, optionsToGo.length);
            const nextPointName = optionsToGo[nextPointNumber];
            nextProperties['ID'] = i;
            nextProperties['Status'] = healthStatusUser;
            nextProperties['BeaconCellName'] = nextPointName;
            userStayPointsArray.push(nextPointName);
            let stayTimeNextPoint = randomNumber(options.minimumTime, options.maximumTime);
            nextProperties['Duration'] = stayTimeNextPoint;
            nextProperties['Time'] = userTrajectory[userTrajectory.length - 1].Exit_Date;
            nextProperties['Exit_Date'] = moment(new Date(nextProperties['Time']).setSeconds(endDate.getSeconds() + nextProperties['Duration'])).toISOString();

            nextProperties['GPS_Time'] = gpsTime.toUnixMS(new Date(nextProperties['Time']).getTime());
            nextProperties['GPS_Exit_Time'] = gpsTime.toUnixMS(new Date(nextProperties['Exit_Date']).getTime());

            inputData.features.forEach(beacon => {
                if (beacon.properties.name === nextPointName) {
                    nextProperties['BeaconLatitude'] = beacon.geometry.coordinates[1];
                    nextProperties['BeaconLongitude'] = beacon.geometry.coordinates[0];
                }
            })

            nextProperties['BeaconAltitude'] = 8.6;
            nextProperties['JobType'] = jobTypeUser;
            nextProperties['ActivityType'] = "Working";
            userTrajectory.push(nextProperties);
            endDate = new Date(moment(nextProperties['Exit_Date']).toISOString())
        }

        let data = JSON.stringify(userTrajectory);
        fs.writeFileSync(path, data);

        writeCsv(userTrajectory, i);
        console.log("The JSON file was written successfully for the user " + i)
    }

    csvCreatorUsers(usersArray)
})();
