const fs = require("fs");


module.exports = {
    getAmount,
    manualAddPoints,
    addCheerPoints,
    loadPointValueOnStartUp,
    resetMilestones,
    subCalculation,
};

let pointTracker = 0;

//These values are current hard coded
//TODO: look at having these load from an XML or DB
const milestoneFolderPath = './botinfo/milestones/'
const tier1 = 500;
const prime = 500;
const tier2 = 1000;
const tier3 = 1500;
const milestone15 = 15000;
const milestone30 = 30000;
const reward15 = "'Spyro: YotD' stream";
const reward30 = "OOT: JOTWAD";


//Dont think this function is needed
function getAmount(target, context, params, client, channelName){
    client.say(channelName, `Thanks ${context.username}, so far we have reached ${pointTracker} points!`);
    writeForStream();
    return pointTracker
};

//TODO: Would it be better to have a Set points command as well?
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

function addCheerPoints(bits) {
    pointTracker += bits;
    writeForStream();
    console.log(`Added ${bits} to total`)
}

function subCalculation(isPrime, method) {
    if (isPrime) {
        pointTracker += prime;
    } else {
        switch (method) {
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
                console.log('Cannot find the plan.', method);
        }
    }
    writeForStream();
}

function loadPointValueOnStartUp() {
    fs.readFile(`${milestoneFolderPath}currentPoints.txt`, "utf8", (err, data) => {
        if (err)
            console.log(err);
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
    let fileName = `${milestoneFolderPath}${textFileName}`
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
// to be used by mods to reset pointsTracker
function resetMilestones(target, context, params, client, channelName) {
    if(context.mod || context.badges['broadcaster'] === '1'){
        pointTracker = 0;
        storeCurrentValue();
        writeForStream();
    } else {
        client.say(channelName, `Sorry ${context.username} only mods can reset the point total!`);
    }
}