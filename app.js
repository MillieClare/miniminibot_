// Based heavily off https://dev.twitch.tv/docs/irc/

const fs = require("fs");
const path = require("path");
const tmi = require('tmi.js');
const xml2js = require('xml2js');
const player = require('play-sound')({ player: "ffplay" }); //decided on ffplay as it is more realiable when playing mp3s
const bcmd = require("./basiccmds.js");
const rickstream = require("./rickstream.js");
const milestones = require("./milestones.js");

let parser = new xml2js.Parser({ attrkey: "ATTR" });

//moved bot information to external text file
const botinfopath = path.join(__dirname, "botinfo");
let channelName = ""; //this variable can be set in the config xml file

let knownCommands = {
    twitter: bcmd.twitter,
    commands: bcmd.commands,
    so: bcmd.so,
    time: bcmd.time,
    sub: bcmd.sub,
    follow: bcmd.follow,
    hype: bcmd.hype,
    lurk: bcmd.lurk,
    discord: bcmd.discord,
    raid: bcmd.raid,
    raiod: bcmd.raid,
    focus: bcmd.focus,
    pb: bcmd.pb,
    zootr: bcmd.zootr,
    newsub: bcmd.newsub,
    subperks: bcmd.subperks,
    addPoints: milestones.manualAddPoints,
    getPoints: milestones.getAmount,
    reset: milestones.resetMilestones,
};

//TODO: Might be worth spliting this list into Normal commands and Mod commands

let commandPrefix = ""; //this variable can be set in the config xml file
const client = new tmi.client(getConfigSettings());
client.connect();


function getXMLFileObject(filename) {
    if (!fs.existsSync(filename)) {
        console.log("Could not find requested xml file")
        return;
    }
    let xmlstring = fs.readFileSync(filename, "utf8");
    let xmlfile;
    parser.parseString(xmlstring, function (err, result) {
        if (err) throw err;
        xmlfile = result;
    });

    return xmlfile;
}

function playSound(filename) {
    player.play(filename, { ffplay: ["-nodisp"] }, (err) => {
        if (err) console.log('error ' + err);
    });
}

//moved settings to xml file, new function should contruct options for tmi
function getConfigSettings() {


    let filename = path.join(botinfopath, "creds", "config.xml");
    let xmlfile = getXMLFileObject(filename);

    //global settings
    commandPrefix = xmlfile["config"]["bot"][0]["settings"][0]["commandperfix"][0];
    soundcooldownseconds = (isNaN(xmlfile["config"]["bot"][0]["settings"][0]["soundcooldown"][0]) ? 0 : parseInt(xmlfile["config"]["bot"][0]["settings"][0]["soundcooldown"][0]));
    subwelcome = (xmlfile["config"]["bot"][0]["settings"][0]["subwelcome"][0] === "true");
    giveawaysubenteries = (isNaN(xmlfile["config"]["bot"][0]["settings"][0]["giveawaysubenteries"][0]) ? 1 : parseInt(xmlfile["config"]["bot"][0]["settings"][0]["giveawaysubenteries"][0]));
    giveawaydefaultenteries = (isNaN(xmlfile["config"]["bot"][0]["settings"][0]["giveawaydefaultenteries"][0]) ? 1 : parseInt(xmlfile["config"]["bot"][0]["settings"][0]["giveawaydefaultenteries"][0]));
    channelName = xmlfile["config"]["bot"][0]["info"][0]["channelname"][0];
    //end of global settings

    let options = {
        options: {
            debug: (xmlfile["config"]["settings"][0]["options"][0]["debug"][0] === "true"),
        },
        connection: {
            cluster: xmlfile["config"]["settings"][0]["connection"][0]["cluster"][0],
            reconnect: (xmlfile["config"]["settings"][0]["connection"][0]["reconnect"][0] === "true"),
        },
        identity: {
            username: xmlfile["config"]["bot"][0]["info"][0]["username"][0],
            password: xmlfile["config"]["bot"][0]["info"][0]["password"][0],
        },
        channels: [channelName]
    };
    return options;
}

function onMessageHandler(target, context, msg, self) {
    if (self) {
        return;
    }
    if (msg.charAt(0) !== commandPrefix) {
        console.log(`[${target} (${context['message-type']})] ${context.username}: ${msg}`);
        return;
    }


    const parse = msg.slice(1).split(' ');

    const commandName = parse[0];

    const params = parse.splice(1);
    console.log(params);

    if (commandName in knownCommands) {

        const command = knownCommands[commandName];

        command(target, context, params, client, channelName);
        console.log(`* Executed ${commandName} command for ${context.username}`);
    } else {
        console.log(`* Unknown command ${commandName} from ${context.username}`);
    }
}

function onCheerHandler(channel, userState, message) {
    //This function is used to handle what happens when users send bits to the channel
    console.log(`${userState.username} has cheered ${userState.bits}`);
    milestones.addCheerPoints(parseInt(userState.bits));
}

function onSubHandler(channel, username, methods, message, userstate) {
    //This function is used to handle what happens when users sub to the channel
    let outputMsg = ``;
    if (methods.prime) {
        outputMsg = `${userstate.username} has subbed using method PRIME`;
    } else {
        outputMsg = `${ userstate.username } has subbed using method ${ methods.plan }`;
    }
    console.log(outputMsg);
    milestones.subCalculation(methods.prime, methods.plan);
}

function onReSubHandler(channel, username, months, message, userstate, methods) {
    //This function is used to handle what happens when users resub to the channel
    let outputMsg = ``;
    if (methods.prime) {
        outputMsg = `${userstate.username} has resubbed using method PRIME`;
    } else {
        outputMsg = `${userstate.username} has resubbed using method ${methods.plan}`;
    }
    console.log(outputMsg);
    milestones.subCalculation(methods.prime, methods.plan);
}

function onSubGiftHandler(channel, username, streakMonths, recipient, methods, userstate) {
    //This function is used to handle what happens when users gift subs to the channel
    console.log(`${userstate.username} has gifted a sub to ${recipient} using method ${methods.plan}`);
    milestones.subCalculation(methods.prime, methods.plan);
}

client.on("message", onMessageHandler);

//NEW FUNCTION FOR HANDLEING STREAM EVENTS
//bits
client.on("cheer", onCheerHandler);
//User subs
client.on("subscription", onSubHandler);
client.on("resub", onReSubHandler);
//Gifted subs
client.on("subgift", onSubGiftHandler);

//This client on function is no longer needed unless points need to
//be calculated differently based on amount gifted
//client.on("submysterygift", onSubGiftHandler);


//This may be the best place to place start up commands, needs to be explored more
client.on("connected", function (address, port) {
    console.log("Address: " + address + " Port: " + port);
    milestones.loadPointValueOnStartUp();
});



