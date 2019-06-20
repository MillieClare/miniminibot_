// Based heavily off https://dev.twitch.tv/docs/irc/

const fs = require("fs");
const path = require("path");
const tmi = require('tmi.js');
const xml2js = require('xml2js');
const player = require('play-sound')({player: "ffplay"}); //decided on ffplay as it is more realiable when playing mp3s

let parser = new xml2js.Parser({ attrkey: "ATTR" });

//moved bot information to external text file
const botinfopath = path.join(__dirname, "botinfo");
let channelName = ""; //this variable can be set in the config xml file

//these are the sound variables
const soundspath = path.join(__dirname, "sounds"); //the base location for all sounds
let soundcooldownseconds = 0; //this variable can be set in the config xml file
let soundcooldown = new Date(); //set cooldown to date type

let subwelcome = false; //this variable can be set in the config xml file
let sublist = setUpSubList();

let giveawayentrylist = [];
let giveawayopen = false;
let giveawaysubenteries = 0; //this variable can be set in the config xml file
let giveawaydefaultenteries = 0; //this variable can be set in the config xml file

let knownCommands = {
    twitter,
    commands,
    so,
    time,
    sub,
    follow,
    hype,
    lurk,
    discord,
    hi,
    uptime,
    howareyou,
    raid,
    focus,
    pb,
    zootr,
    fanfare,
    quotes,
    newquote,
    giveawaystart,
    enter,
    giveawayend,
    decidewinner,
};

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

function setUpSubList() {
    let filename = path.join(botinfopath, "sublist.xml");
    let xmlfile = getXMLFileObject(filename);

    let subarray = xmlfile["subs"]["sub"]

    let tmpList = [];
    for (let i = 0; i < subarray.length; i++) {
        let username = subarray[i]["username"][0];
        tmpList[username] = {
            welcomesong: subarray[i]["welcomesong"][0],
            welcomed: false,
        }
    }
    return tmpList;
}

function playSubWelcomeSong(context) {
    let filepath = path.join(soundspath, "subwelcome");
    //check if in sublist
    if (context.username in sublist) {
        if (sublist[context.username]["welcomed"]) { return; }
        filepath = path.join(filepath,sublist[context.username]["welcomesong"]);
        sublist[context.username]["welcomed"] = true;
        playSound(filepath);
        return;
    }
    //if not in sub list play default and add to sub list
    filepath = path.join(filepath, "default.mp3");
    sublist[context.username] = {
        welcomesong: "default.mp3",
        welcomed: true,
    };
    playSound(filepath);
}

function soundsCoolDownCheck() {
    /// <summary> Checks whether the cooldown for sounds has expired, this will stop sound spam. </summary>
    /// <returns type="Bool"> On cooldown or not </returns>
    let currentTime = new Date();
    if (currentTime.getTime() < soundcooldown.getTime()) {
        console.log("sounds are currently on cooldown");
        return false;
    }
    else {
        return true;
    }
}

function fanfare(target, context, params) {
    //first check whether sounds are off cooldown
    if (!soundsCoolDownCheck()) { return; }
    //Get folder location of farfare files
    let fanfarepath = path.join(soundspath, "fanfare");
    //list all mp3s in this array
    let fanfarearray = [
        "ffviifanfare.mp3",
        "JiggyFanfare.mp3",
        "grandia2fanfare.mp3",
        "grandiafanfare.mp3",
        "soinc12fanfare.mp3",
        "sonic3fanfare.mp3",
        "sonickfanfare.mp3",
    ];
    //generate random key from array length
    let fanfarekey = Math.floor(Math.random() * fanfarearray.length);
    //add file to the folder path
    var filepath = path.join(fanfarepath, fanfarearray[fanfarekey]);
    //display what file is being requested
    console.log("Playing: " + fanfarearray[fanfarekey]);
    //play file using install cmd mp3 player, throw error if one can not be found
    playSound(filepath);
    //set new cooldown time
    soundcooldown = new Date();
    soundcooldown.setSeconds(soundcooldown.getSeconds() + soundcooldownseconds);
}

function giveawaystart(target, context, params) {
    if (!context.mod) {
        console.log(`${context.username} tried to start a giveaway but is not a mod`)
        return;
    }
    giveawayentrylist = [];
    giveawayopen = true;
    client.say(channelName, "The Milliebug giveaway has begun. If you would like to entery please type !enter");
}

function enter(target, context, params) {
    if (!giveawayopen) {
        console.log("There is no giveaway live right now.")
        return;
    }
    if (checkuserentry(context.username)) {
        console.log(`${context.username} has already entered the giveaway`)
        return;
    }
    let numEnteries = context.subscriber ? giveawaysubenteries : giveawaydefaultenteries;
    for (let i = 0; i < numEnteries; i++) {
        giveawayentrylist.push(context.username);
    }
    console.log(`${context.username} has enter the giveaway ${numEnteries} time(s)`);
}

function checkuserentry(username) {
    for (let i = 0; i < giveawayentrylist.length; i++) {
        if (giveawayentrylist[i] === username) { return true; }
    }
    return false;
}

function giveawayend(target, context, params) {
    if (!context.mod) {
        console.log(`${context.username} tried to end a giveaway but is not a mod`)
        return;
    }
    giveawayopen = false;
    client.say(channelName, "The Milliebug giveaway has ended. The winner will be drawn soon. Good luck to everyone! millie4Hype");
}

function decidewinner(target, context, params) {
    if (!context.mod) {
        console.log(`${context.username} tried to decide the winner of the giveaway but is not a mod`)
        return;
    }
    if (giveawayopen || giveawayentrylist.length < 1) {
        console.log("Giveaway is still open or there are no enteries, a winner can not be decided.");
        return;
    }
    let winnernumber = Math.floor(Math.random() * giveawayentrylist.length);
    client.say(channelName, "The winner of the giveaway is......");
    client.say(channelName, `millie4Hype ${giveawayentrylist[winnernumber]} millie4Hype CONGRATULATIONS millie4Hype`)
}

function twitter(target, context, params) {
    client.say(channelName, "You can follow Millie on Twitter www.twitter.com/_Milliebug_ !");
}

function raid(target, context, params) {
    client.say(channelName, "Sub message:");
    client.say(channelName, "millie4Hype millie4Hype MINI RAID millie4Hype millie4Hype");
    client.say(channelName, "Non-sub message:");
    client.say(channelName, "PurpleStar PurpleStar MINI RAID PurpleStar PurpleStar");
}

function focus(target, context, params) {
    client.say(channelName, "Millie isn't very good at multi-tasking! She will definitely reply to your message once things cool down in-game!");
}

function pb(target, context, params) {
    client.say(channelName, "Millie's best time in zootr is currently 3 hours, 45 minutes and 18 seconds!");
}

function zootr(target, context, params) {
    client.say(channelName, "In this version of Zelda, all of the items have been randomly shuffled for a more dynamic player experience.");
}

function commands(target, context, params) {
    client.say(channelName, "Current commands can be found here: https://bit.ly/2BZSGAM");
}

function so(target, context, params) {
    if (params.length < 1) {
        console.log("No channel name given")
        return;
    }
    client.say(channelName, `Thank you twitch.tv/${params[0]} for supporting the channel - make sure to show them some love! millie4Cute`);
}

function time(target, context, params) {
    let d = new Date();
    let hour = d.getHours();
    let min = d.getMinutes();
    let sec = d.getSeconds();
    if (hour < 10) { hour = `0${hour}`; }
    if (min < 10) { min = `0${min}`; }
    if (sec < 10) { sec = `0${sec}`; }
    client.say(channelName, `Millie's timezone is BST, the current time is ${hour}:${min}:${sec}`);

}

function hi(target, context, params) {
    let filename = path.join(botinfopath, "responses", "hi.txt");
    if (!fs.existsSync(filename)) {
        console.log("Could not find Hi responses text file")
        return;
    }
    let responses = fs.readFileSync(filename, "utf8").split("\n");
    let responseNumber = Math.floor(Math.random() * responses.length);
    let response = responses[responseNumber].replace("#USERNAME#", context.username).replace("#CHANNEL#", channelName);
    client.say(channelName, response);
}

function howareyou(target, context, params) {
    let filename = path.join(botinfopath, "responses", "howareyou.txt");
    if (!fs.existsSync(filename)) {
        console.log("Could not find Howareyou responses text file")
        return;
    }
    let responses = fs.readFileSync(filename, "utf8").split("\n");
    let responseNumber = Math.floor(Math.random() * responses.length);
    let response = responses[responseNumber].replace("#USERNAME#", context.username).replace("#CHANNEL#", channelName);
    client.say(channelName, response);
}

function quotes(target, context, params) {
    let filename = path.join(botinfopath, "quotes", "quotes.txt");
    if (!fs.existsSync(filename)) {
        console.log("Could not find Quotes text file")
        return;
    }
    let quotes = fs.readFileSync(filename, "utf8").split("\n");
    if (quotes.length <= 1) {
        console.log("There are no quotes to load");
        return;
    }
    quotes.pop(quotes.length);
    let quoteNumber = Math.floor(Math.random() * quotes.length);
    client.say(channelName, quotes[quoteNumber]);
}

function newquote(target, context, params) {
    let filename = path.join(botinfopath, "quotes", "quotes.txt");
    let quote = "";
    for (let i = 0; i < params.length; i++) {
        quote += (params[i] + ' ');
    }
    quote = quote.slice(0, -1);
    quote += '\n';
    fs.appendFile(filename, quote, function (err) {
        if (err) throw err;
        console.log("Quote saved");
    });
}

function sub(target, context, params) {
    client.say(channelName, "Enjoying the stream? Want your own song? Click here -> twitch.tv/products/milliebug_ or use Twitch Prime to sub for free!");
}

function follow(target, context, params) {
    client.say(channelName, "Smash that follow button for a cookie <3");
}

function hype(target, context, params) {
    client.say(channelName, "TwitchUnity millie4Minihype MorphinTime millie4Minihype KAPOW millie4Minihype MorphinTime millie4Minihype TwitchUnity millie4Minihype TwitchUnity millie4Minihype MorphinTime millie4Minihype KAPOW millie4Minihype MorphinTime millie4Minihype TwitchUnity");
}

function lurk(target, context, params) {
    client.say(channelName, "Lurk mode activated! Remember that when you mute a stream you do not count as a viewer! Please mute the tab or window instead - you rock!");
}

function discord(target, context, params) {
    client.say(channelName, "Wanna join my Discord family? Click here: https://discord.gg/E2zvvhn");
}



function uptime(target, context, params) {
    let currentTime = new Date();
    let timeDifference = currentTime.getTime() - startTime.getTime();
    console.log(timeDifference);

    let hours = Math.floor(timeDifference / (1000 * 60 * 60));
    let minutes = Math.floor(timeDifference / (1000 * 60)) % 60;
    let seconds = Math.floor(timeDifference / 1000) % 60;

    let hoursWord = (hours === 1) ? 'hour' : 'hours';
    let minutesWord = (minutes === 1) ? 'minute' : 'minutes';
    let secondsWord = (seconds === 1) ? 'second' : 'seconds';

    client.say(channelName, `Millie has been live for ${hours} ${hoursWord}, ${minutes} ${minutesWord} and ${seconds} ${secondsWord}. `);

}



function onMessageHandler(target, context, msg, self) {
    if (self) {
        return;
    }
    if (subwelcome && context.subscriber) {
        playSubWelcomeSong(context);
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

        command(target, context, params);
        console.log(`* Executed ${commandName} command for ${context.username}`);
    } else {
        console.log(`* Unknown command ${commandName} from ${context.username}`);
    }
}

client.on("message", onMessageHandler);


let startTime;


client.on("connected", function (address, port) {
    console.log("Address: " + address + " Port: " + port);
    startTime = new Date();
    console.log(startTime);

});



