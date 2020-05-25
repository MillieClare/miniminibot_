const fs = require("fs");


module.exports = {
    getAmount,
    manualAddPoints,
    addCheerAmount,
    subGift,
    subBomb,
    subscription,
    reSubscription,
    loadPointValueOnStartUp,
};

let pointTracker = 0;
const tier1 = 500;
const prime = 500;
const tier2 = 1000;
const tier3 = 1500;

const milestone15 = 15000;
const milestone30 = 30000;
const reward15 = "'Spyro: YotD' stream";
const reward30 = "OOT: JOTWAD";



function getAmount(target, context, params, client, channelName){
    client.say(channelName, `Thanks ${context.username}, so far we have reached ${pointTracker} points!`);
    writeForStream();
    return pointTracker
};

function manualAddPoints(target, context, params, client, channelName){
    let checkAmount = parseInt(params[0]);
    if(context.mod || context.badges['broadcaster'] === '1'){
        if(!isNaN(checkAmount)) {
            pointTracker += checkAmount;
            client.say(channelName, `Thanks ${context.username}, I have added ${checkAmount} points to the tracker!`);
            storeCurrentValue();
            writeForStream();
        } else {
            console.log('Can only add numbers to total');
            client.say(channelName, `Sorry ${context.username} I can only add numbers to the point total`);
        }
    } else {
        client.say(channelName, `Sorry ${context.username} only mods can add to the point total!`);
    }
};

function addCheerAmount(channel, userState, message) {
    let bitsCheered = parseInt(userState.bits);
    pointTracker += bitsCheered;
    writeForStream();
    console.log(`Added ${bitsCheered} to total`)
    //client.say(channelName, `Thanks ${context.username} for cheering ${bitsCheered} bitties!, I have added ${bitsCheered} points to the tracker!`);
}

function subGift(channel, username, streakMonths, recipient, methods, userstate) {
    console.log(methods)
    if(methods.prime){
        pointTracker += prime;
        writeForStream();
        return
    }
    switch (methods.plan) {
        case '1000':
            pointTracker += tier1;
            //console.log(`Given a gift sub to ${recipient} from ${username}, they have subbed for ${streakMonths}, 
            //the new point total is now ${pointTracker} -----> channel = ${channel}, userstate = ${userstate}`)
            break;
        case '2000':
            pointTracker += tier2;
            break;
        case '3000':
            pointTracker += tier3;
            break;
        default:
            console.log('Cannot find the plan.', methods['plan']);
    }
    writeForStream();
}

function subBomb(channel, username, numbOfSubs, methods, userstate) {
    if(numbOfSubs >= 5){
        pointTracker += (tier1 + 100) * numbOfSubs;
        writeForStream();
        return
    } else {
        pointTracker += (numbOfSubs * tier1)
        console.log(`Mystery gift sub points added! points are now: ${pointTracker}`)
    }
    writeForStream();
}

function subscription(channel, username, methods, message, userstate) {
    console.log(methods)
    if(methods.prime){
        pointTracker += prime;
        writeForStream();
        return
    }
    switch (methods.plan) {
        case '1000':
            pointTracker += tier1;
            console.log(`Given a gift sub to ${recipient} from ${username}, they have subbed for ${streakMonths}, 
            the new point total is now ${pointTracker} -----> channel = ${channel}, userstate = ${userstate}`)
            break;
        case '2000':
            pointTracker += tier2;
            break;
        case '3000':
            pointTracker += tier3;
            break;
        default:
            console.log('Cannot find the plan.', methods['plan']);
    }
    writeForStream();
}

function reSubscription(channel, username, months, message, userstate, methods) {
    console.log(methods)
    if(methods.prime){
        pointTracker += prime;
        writeForStream();
        return
    }
    switch (methods.plan) {
        case '1000':
            pointTracker += tier1;
            break;
        case '2000':
            pointTracker += tier2;
            break;
        case '3000':
            pointTracker += tier3;
            break;
        default:
            console.log('Cannot find the plan.', methods['plan']);
    }
    writeForStream();
}

// function checkTextFileExistsAndCreateIfDoesNot() {
//     let fileName = './points.txt'
//     let textInFile = `Total Points: ${pointTracker}\nNext Milestone: ${getMilestone()}`
//     fs.writeFile(fileName, textInFile, function(error){
//         if(error){
//             throw new Error;
//         } else {
//             console.log('file created')
//         }
//     })
// }

const milestoneString = './.vs/miniminibot_/milestones/'

function loadPointValueOnStartUp() {
    // storeCurrentValue();
    fs.readFile(`${milestoneString}currentPoints.txt`, "utf8", (err, data) => {
        pointTracker = parseInt(data);
        return pointTracker;
    });
}

function writeForStream() {
    let textToDisplay = currentMilestone(pointTracker);
    createTextFile('outputForObs.txt', textToDisplay);
}

function storeCurrentValue() {
    createTextFile('currentPoints.txt', `${pointTracker}`);
}

function createTextFile(textFileName, textInFile){
    let fileName = `./.vs/miniminibot_/milestones/${textFileName}`
    fs.writeFile(fileName, textInFile, function(error){
        if(error){
            throw new Error;
        } else {
            console.log('file created');
        }
    });
}

function currentMilestone(pointTracker){
    if(pointTracker > milestone15) {
        return `Points Goal: ${pointTracker}/${milestone30}\nReward: ${reward30}`;
    } else {
        return `Points Goal: ${pointTracker}/${milestone15}\nReward: ${reward15}`;
    }
}
