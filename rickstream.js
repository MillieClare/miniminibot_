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

function subBomb(channel, username, numbOfSubs, methods, userstate) {
    if(numbOfSubs >= 5){
        pointTracker +=  100 * numbOfSubs;
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

function checkTextFileExistsAndCreateIfDoesNot() {
    let fileName = './points.txt'
    let textInFile = `Total Points: ${pointTracker}\nNext Milestone: ${getMilestone()}`
    fs.writeFile(fileName, textInFile, function(error){
        if(error){
            throw new Error;
        } else {
            console.log('file created')
        }
    })
}

function getMilestone(){
    let milestone = ''
    switch(true) {
        case (pointTracker >= 10000 && pointTracker < 20000):
            return milestone = 'Millie and Daz music stream';
        case (pointTracker >= 20000 && pointTracker < 30000):
            return milestone = 'Ask Millie anything';
        case (pointTracker >= 30000 && pointTracker < 40000):
            return milestone = 'Millie plays Dream Daddy';
        case (pointTracker >= 40000 && pointTracker < 50000):
            return milestone = 'Dark souls Co-op with Kari';
        case (pointTracker >= 50000 && pointTracker < 69420):
            return milestone = 'Millie & Daddy Rick play Dream Daddy';
        case (pointTracker >= 69420 && pointTracker < 80000):
            return milestone = 'Dead space stream with scare alerts';
        case (pointTracker >= 80000 && pointTracker < 100000):
            return milestone = 'Rick Stream v2.0: Electric Boogaloo';
        case (pointTracker >= 100000):
            return milestone = 'All milestones hit => chat suggest stretch goals'; 
        default:
            return milestone = 'Millie and Becky Co-op ZOoTR';
    }
}
