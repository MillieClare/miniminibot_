// Based heavily off https://dev.twitch.tv/docs/irc/

const fs = require("fs");
const path = require("path");
const tmi = require('tmi.js');
const player = require('play-sound')();

const channelName = "Milliebug_";

const options = {
    options: {
        debug: true
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: "miniminibot_",
        password: "oauth:0l1ddwius541pn3vjcorz2rwiwdk0s"
    },
    channels: [channelName]

};
//these are the sound variables
let soundspath = path.join(__dirname,"sounds"); //the base location for all sounds
let soundcooldown = new Date(); //set cooldown to date type
let soundcooldownseconds = 30; //this is the default cooldown time can be ajusted to users needs

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
};

let commandPrefix = '!';

const client = new tmi.client(options);
client.connect();


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
    var fanfarepath = path.join(soundspath, "fanfare");
    //list all mp3s in this array
    let fanfarearray = [
        "ffviifanfare.mp3",
        "JiggyFanfare.mp3",
    ];
    //generate random key from array length
    let fanfarekey = Math.floor(Math.random() * fanfarearray.length);;
    //add file to the folder path
    var filepath = path.join(fanfarepath, fanfarearray[fanfarekey]);
    //display what file is being requested
    console.log("Playing: " + fanfarearray[fanfarekey]);
    //play file using install cmd mp3 player, throw error if one can not be found
    player.play(filepath, (err) => {
        if (err) console.log('error ' + err);
    });
    //set new cooldown time
    soundcooldown = new Date();
    soundcooldown.setSeconds(soundcooldown.getSeconds() + soundcooldownseconds);
}

function twitter(target, context, params) {
    client.say(channelName, "You can follow Millie on Twitter www.twitter.com/_Milliebug_ !");
}

function raid(target, context, params) {
    client.say(channelName, "Sub message:\nmillie4Hype millie4Hype MINI RAID millie4Hype millie4Hype\nNon-sub message:\nPurpleStar PurpleStar MINI RAID PurpleStar PurpleStar");
}

function focus(target, context, params) {
    client.say(channelName, "Millie isn't very good at multi-tasking! She will definitely reply to your message once things cool down in-game!");
}

function pb(target, context, params) {
    client.say(channelName, "Millie's best time is currently 3 hours, 45 minutes and 18 seconds!");
}

function zootr(target, context, params) {
    client.say(channelName, "In this version of Zelda, all of the items have been randomly shuffled for a more dynamic player experience.");
}

function commands(target, context, params) {
    client.say(channelName, "Current commands can be found here: https://bit.ly/2BZSGAM");
}

function so(target, context, params) {
    client.say(channelName, `Thank you twitch.tv/${params[0]} for supporting the channel - make sure to show them some love!`);
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
    let responses = [
        `Heya ${context.username}, how are you today?`,
        `Hi ${context.username}, how has your day been?`,
        `Yo yo yo ${context.username}, how's it hangin'?`,
        `Oh, ${context.username}... it's you... `,
        `Eyyy, ${context.username}... How you doin'?`,
    ];
    
    let responseNumber = Math.floor(Math.random() * responses.length);
    client.say(channelName, responses[responseNumber]);
}

function howareyou(target, context, params) {
    let responses = [
        `I'm great, thank you so much for asking ${context.username}!`,
        `The usual, @${channelName} is SOOOO demanding... you know what she's like...`,
        `I'm just happy it's a stream day, you know what I mean?`,
        `Well now that you're here ${context.username}, I'm obviously fantastical!`,
    ];
    let responseNumber = Math.floor(Math.random() * responses.length);
    client.say(channelName, responses[responseNumber]);
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

    let hoursWord = 'hours';
    let minutesWord = 'minutes';
    let secondsWord = 'seconds';

    if (seconds === 1) {
        secondsWord = 'second';
    }

    if (minutes === 1) {
        minutesWord = 'minute';
    }

    if (hours === 1) {
        hoursWord = 'hour';
    }

    client.say(channelName, `Millie has been live for ${hours} ${hoursWord}, ${minutes} ${minutesWord} and ${seconds} ${secondsWord}. `);


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



