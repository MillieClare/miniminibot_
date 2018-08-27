// Based heavily off https://dev.twitch.tv/docs/irc/

const tmi = require('tmi.js');

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
        password: ""
    },
    channels: ["Milliebug_"]

};

let knownCommands = { twitter, commands, so, time };
let commandPrefix = '!';

const client = new tmi.client(options);
client.connect();


function twitter(target, context, params) {
    client.say("Milliebug_", "You can follow Millie on Twitter www.twitter.com/_Milliebug_ !");
}

function commands(target, context, params) {
    client.say("Milliebug_", "Current commands can be found here: ");
}

function so(target, context, params) {
    client.say("Milliebug_", `Thank you ${params[0]} for supporting the channel - make sure to show them some love!`);
}

function time(target, context, params) {
    let d = new Date();
    client.say("Milliebug_", `Millie's timezone is BST, the current time is ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);

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

client.on("connected", function (address, port) {
    console.log("Address: " + address + " Port: " + port);
});


