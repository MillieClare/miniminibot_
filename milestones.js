const fs = require("fs");


module.exports = {
    getAmount,
    manualAddPoints,
    addCheerAmount,
    subGift,
    subBomb,
    subscription,
    reSubscription,
};

let pointTracker = 0;
const tier1 = 600;
const prime = 600;
const tier2 = 1500;
const tier3 = 3500;


function getAmount(target, context, params, client, channelName){
    client.say(channelName, `Thanks ${context.username}, so far we have reached ${pointTracker} points!`);
    checkTextFileExistsAndCreateIfDoesNot();
    return pointTracker
};

function manualAddPoints(target, context, params, client, channelName){
    let checkAmount = parseInt(params[0]);
    if(context.mod || context.badges['broadcaster'] === '1'){
        if(!isNaN(checkAmount)) {
            pointTracker += checkAmount;
            client.say(channelName, `Thanks ${context.username}, I have added ${checkAmount} points to the tracker!`);
            checkTextFileExistsAndCreateIfDoesNot();
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
    checkTextFileExistsAndCreateIfDoesNot()
    console.log(`Added ${bitsCheered} to total`)
    //client.say(channelName, `Thanks ${context.username} for cheering ${bitsCheered} bitties!, I have added ${bitsCheered} points to the tracker!`);
}

function subGift(channel, username, streakMonths, recipient, methods, userstate) {
    console.log(methods)
    if(methods.prime){
        pointTracker += prime;
        checkTextFileExistsAndCreateIfDoesNot()
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
    checkTextFileExistsAndCreateIfDoesNot()
}

function subBomb(channel, username, numbOfSubs, methods, userstate) {
    if(numbOfSubs >= 5){
        pointTracker += (tier1 + 100) * numbOfSubs;
        checkTextFileExistsAndCreateIfDoesNot()
        return
    } else {
        pointTracker += (numbOfSubs * tier1)
        console.log(`Mystery gift sub points added! points are now: ${pointTracker}`)
    }
    checkTextFileExistsAndCreateIfDoesNot()
}

function subscription(channel, username, methods, message, userstate) {
    console.log(methods)
    if(methods.prime){
        pointTracker += prime;
        checkTextFileExistsAndCreateIfDoesNot()
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
    checkTextFileExistsAndCreateIfDoesNot()
}

function reSubscription(channel, username, months, message, userstate, methods) {
    console.log(methods)
    if(methods.prime){
        pointTracker += prime;
        checkTextFileExistsAndCreateIfDoesNot()
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
    checkTextFileExistsAndCreateIfDoesNot()
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

function getMilestone(){

}

function storeCurrentValue() {
    createTextFile('currentPoints.txt', `${pointTracker}`);
}

function currentMilestoneProgress() {
    createTextFile('currentMilestoneName.txt')
}

function createTextFile(textFileName, textInFile){
    let fileName = `./.vs/miniminibot_/milestones/${textFileName}.txt`
    fs.writeFile(fileName, textInFile, function(error){
        if(error){
            throw new Error;
        } else {
            console.log('file created');
        }
    });
}

function writeForStream() {
    createTextFile('outputForObs.txt', `Total Points: ${pointTracker}\nReward at: ${getMilestone()}`);
}

// current value
// current milestone progress
// display on stream