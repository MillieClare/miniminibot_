// Based heavily off https://dev.twitch.tv/docs/irc/

const fs = require("fs");
const path = require("path");
const tmi = require('tmi.js');
const xml2js = require('xml2js');
const player = require('play-sound')({ player: "ffplay" }); //decided on ffplay as it is more realiable when playing mp3s
const db = require("./db.js");
const bcmd = require("./basiccmds.js");
const rickstream = require("./rickstream.js");
const milestones = require("./milestones.js");

let parser = new xml2js.Parser({ attrkey: "ATTR" });

//moved bot information to external text file
const botinfopath = path.join(__dirname, "botinfo");
let channelName = ""; //this variable can be set in the config xml file
//these are the sound variables
const soundspath = path.join(__dirname, "sounds"); //the base location for all sounds
let soundcooldownseconds = 0; //this variable can be set in the config xml file
let soundcooldown = new Date(); //set cooldown to date type

let subwelcome = false; //this variable can be set in the config xml file
let sublist = [];

let giveawayentrylist = [];
let giveawayopen = false;
let giveawaysubenteries = 0; //this variable can be set in the config xml file
let giveawaydefaultenteries = 0; //this variable can be set in the config xml file

let hiresponses = [];
let howareyouresponses = [];

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
    hi,
    uptime,
    howareyou,
    raid: bcmd.raid,
    raiod: bcmd.raid,
    focus: bcmd.focus,
    pb: bcmd.pb,
    zootr: bcmd.zootr,
    fanfare,
    quotes,
    newquote,
    giveawaystart,
    enter,
    giveawayend,
    decidewinner,
    sc,
    bux: checkminibux,
    addbux,
    flip: usercoinbet,
    newsub: bcmd.newsub,
    subperks: bcmd.subperks,
    addPoints: milestones.manualAddPoints,
    getPoints: rickstream.getAmount,
    reset: milestones.resetMilestones,
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
    if (!db.dbCheck) {
        console.log("Unable to connected to database");
        process.exit();
    }


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
    //db data
    db.getSublist(function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        sublist = data;
    });
    db.getResponses("hi",function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        hiresponses = data;
    });
    db.getResponses("howareyou", function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        howareyouresponses = data;
    });
    //end of db data

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
    //display what file is being requested
    category = params.join(' ').toLowerCase();
    db.getFanfares("fanfare", category, "", function (err, data) {
        if (err) {
            category === "" ? console.error("No fanfare was found") : console.error(`No fanfare found with category (${category})`);
            return;
        } else {
            let fanfarekey = Math.floor(Math.random() * data.length);
            let songfile = data[fanfarekey]["filename"];
            console.log(`Playing: ${songfile}`);
            playSound(path.join(fanfarepath, songfile));
            soundcooldown = new Date();
            soundcooldown.setSeconds(soundcooldown.getSeconds() + soundcooldownseconds);
        }
    });
}
//sound clip command example !sc holdit
function sc(target, context, params) {
    if (params.length < 1) {
        console.log("No sound clip file has been entered");
        return;
    }
    if (!soundsCoolDownCheck()) { return; }
    let scpath = path.join(soundspath, "soundclip");
    let soundname = params.join(' ').toLowerCase();
    db.getFanfares("clip", "", soundname, function (err, data) {
        if (err) {
            soundname === "" ? console.error("No sound clip was found") : console.error(`No sound clip found with name (${soundname})`);
            return;
        } else {
            let soundkey = Math.floor(Math.random() * data.length);
            let songfile = data[soundkey]["filename"];
            console.log(`Playing: ${songfile}`);
            playSound(path.join(scpath, songfile));
            soundcooldown = new Date();
            soundcooldown.setSeconds(soundcooldown.getSeconds() + soundcooldownseconds);
        }
    });
}

function giveawaystart(target, context, params) {
    if (!context.mod || context.badges["broadcaster"] != 1) {
        console.log(`${context.username} tried to start a giveaway but is not a mod`)
        return;
    }
    giveawayentrylist = [];
    giveawayopen = true;
    client.say(channelName, "The Milliebug giveaway has begun. If you would like to enter please type !enter");
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
    if (!context.mod || context.badges["broadcaster"] != 1) {
        console.log(`${context.username} tried to end a giveaway but is not a mod`)
        return;
    }
    giveawayopen = false;
    client.say(channelName, "The Milliebug giveaway has ended. The winner will be drawn soon. Good luck to everyone! millie4Hype");
}

function decidewinner(target, context, params) {
    if (!context.mod || context.badges["broadcaster"] != 1) {
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

function hi(target, context, params) {
    let responseNumber = Math.floor(Math.random() * hiresponses.length);
    let response = hiresponses[responseNumber].replace("#USERNAME#", context.username).replace("#CHANNEL#", channelName);
    client.say(channelName, response);
}

function howareyou(target, context, params) {
    let responseNumber = Math.floor(Math.random() * howareyouresponses.length);
    let response = howareyouresponses[responseNumber].replace("#USERNAME#", context.username).replace("#CHANNEL#", channelName);
    client.say(channelName, response);
}

function quotes(target, context, params) {
    db.getResponses("quote", function (err, data) {
        if (err || !data) {
            console.log("No quotes were found");
            return;
        } else {
            let quoteNumber = Math.floor(Math.random() * data.length);
            client.say(channelName, data[quoteNumber]);
        }
    });
}

function newquote(target, context, params) {
    let quote = params.join(' ').replace(/['"]+/g,'\"\"');
    let username = context.username;
    db.addQuote(quote, username, function (msg) {
        client.say(channelName, msg);
    });
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

function checkminibux(target, context, params) {
    db.getCurrency(context.username, function (err, currency) {
        if (err) {
            console.log(err);
        } else {
            client.say(channelName, `${context.username} you have ${currency} minibux`)
        }
    });
}

function addbux(target, context, params) {
    if (context.badges["broadcaster"] != 1 || !context.mod) {
        console.log(`${context.username} does not have permission to use this command`);
        return;
    }
    if (params.length < 2) {
        console.log("Incorroect parameters.");
        console.log("EXAMPLE: !addbux usernmae 100");
        return;
    }
    let adduser = params[0].replace('@', '').toLowerCase();
    let addcurrency = params[1];
    if (isNaN(addcurrency)) {
        console.log(`${addcurrency} is not a valid currency value`);
        return;
    }
    db.getCurrency(adduser, function (err, currency) {
        if (err) {
            console.log("Unable to find user to add currecy to.");
            return;
        }
        let newcurrency = parseInt(currency) + parseInt(addcurrency);
        newcurrency = newcurrency < 0 ? 0 : newcurrency;
        db.changeCurrency(newcurrency, adduser, function (err, msg) {
            if (err) {
                console.log(err);
                return;
            }
            client.say(channelName, msg);
        })
    });
}

function usercoinbet(target, context, params) {
    if (params.length < 2) {
        client.say(channelName, "If you would like to earn bux from a coin flip please type EXAMPLE*!flip heads 50*");
        return;
    }
    let outcomebet = params[0].toLowerCase();
    let amountbet = params[1];
    if (outcomebet != "heads" && outcomebet != "tails") {
        client.say(channelName, `${context.username} ${outcomebet} is not a valid side of a coin. Please type heads or tails.`);
        return;
    }
    if (isNaN(amountbet)) {
        client.say(channelName, `${context.username} ${amountbet} is not a valid betting amount`);
        return;
    }
    db.getCurrency(context.username, function (err, currency) {
        if (err) {
            console.log(err);
        } else {
            if (amountbet > currency) {
                client.say(channelName,`${context.username} you can't bet that amount`)
            } else {
                if (!flipcoin(outcomebet)) {
                    client.say(channelName, `Unlucky ${context.username} you didn't guess correctly, better luck next time. You lose ${amountbet} bux.`);
                    amountbet = -Math.abs(amountbet);
                } else {
                    client.say(channelName, `${context.username} congratulations you guessed right. You win ${amountbet} bux!`)
                }
                let newcurrency = parseInt(currency) + parseInt(amountbet);
                db.changeCurrency(newcurrency, context.username, function (err, msg) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    });
}

function flipcoin(useroutcome) {
    let coin = Math.floor(Math.random() * 2); //0 is tails 1 is heads
    let cointext = coin === 1 ? "heads" : "tails";
    let uoutcome = useroutcome === "heads" ? 1 : 0;
    client.say(channelName, `The coin has been flipped and come out as....${cointext}`);
    return uoutcome === coin;
}

function theSteveProtocol() {
    //add 7hours to current time and date
    //print to chat when psyco_steve enters chat
}

function onMessageHandler(target, context, msg, self) {
    if (self) {
        return;
    }
    if (context.subscriber && subwelcome) {
        playSubWelcomeSong(context);
    }
    db.checkUser(context.username, function (err) {
        if (err) {
            console.log(err);
        }
    });
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

function onSubHandler(channel, username, months, methods, message, userstate) {
    //This function is used to handle what happens when users sub to the channel
}

function onSubGiftHandler(channel, username, streakMonths, recipient, methods, userstate, numbOfSubs) {
    //This function is used to handle what happens when users gift subs to the channel
}

client.on("message", onMessageHandler);

//NEW FUNCTION FOR HANDLEING STREAM EVENTS
//bits
client.on("cheer", onCheerHandler);
//User subs
client.on("subscription", onSubHandler);
client.on("resub", onSubHandler);
//Gifted subs
//client.on("subgift", rickstream.subGift);
client.on("submysterygift", onSubGiftHandler);

let startTime; //Is this still needed?


//This may be the best place to place start up commands, needs to be explored more
client.on("connected", function (address, port) {
    console.log("Address: " + address + " Port: " + port);
    startTime = new Date();
    console.log(startTime);
    milestones.loadPointValueOnStartUp();
});



