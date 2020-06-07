module.exports = {
    twitter,
    raid,
    focus,
    pb,
    zootr,
    commands,
    so,
    time,
    sub,
    follow,
    hype,
    lurk,
    discord,
    newsub,
    subperks,
    subPlanConverter,
};

function twitter(target, context, params, client, channelname) {
    client.say(channelname, "You can follow Millie on Twitter www.twitter.com/_Milliebug_ !");
}

function raid(target, context, params, client, channelname) {
    client.say(channelname, "Sub message:");
    client.say(channelname, "millie4Hi  millie4Hi  Hello we have come to bug you! millie4Hi  millie4Hi ");
    client.say(channelname, "Non-sub message:");
    client.say(channelname, "PurpleStar PurpleStar MINI RAID PurpleStar PurpleStar");
}

function focus(target, context, params, client, channelname) {
    client.say(channelname, "Millie isn't very good at multi-tasking! She will definitely reply to your message once things cool down in-game!");
}

function pb(target, context, params, client, channelname) {
    client.say(channelname, "Millie's best time in zootr is currently 3 hours, 45 minutes and 18 seconds!");
}

function zootr(target, context, params, client, channelname) {
    client.say(channelname, "In this version of Zelda, all of the items have been randomly shuffled for a more dynamic player experience.");
}

function commands(target, context, params, client, channelname) {
    client.say(channelname, "Current commands can be found here: https://bit.ly/2BZSGAM");
}

function so(target, context, params, client, channelname) {
    if (params.length < 1) {
        console.log("No channel name given")
        return;
    }
    client.say(channelname, `Thank you twitch.tv/${params[0]} for supporting the channel - make sure to show them some love! millie4Cute`);
}

function time(target, context, params, client, channelname) {
    let d = new Date();
    let hour = d.getHours();
    let min = d.getMinutes();
    let sec = d.getSeconds();
    if (hour < 10) { hour = `0${hour}`; }
    if (min < 10) { min = `0${min}`; }
    if (sec < 10) { sec = `0${sec}`; }
    client.say(channelname, `Millie's timezone is BST, the current time is ${hour}:${min}:${sec}`);

}

function sub(target, context, params, client, channelname) {
    client.say(channelname, "Enjoying the stream? Want your own song? Click here -> twitch.tv/products/milliebug_ or use Twitch Prime to sub for free!");
}

function follow(target, context, params, client, channelname) {
    client.say(channelname, "Smash that follow button for a cookie <3");
}

function hype(target, context, params, client, channelname) {
    client.say(channelname, "TwitchUnity millie4Hype MorphinTime millie4Hype KAPOW millie4Hype MorphinTime millie4Hype TwitchUnity millie4Hype TwitchUnity millie4Hype MorphinTime millie4Hype KAPOW millie4Hype MorphinTime millie4Hype TwitchUnity");
}

function lurk(target, context, params, client, channelname) {
    client.say(channelname, "Lurk mode activated! Remember that when you mute a stream you do not count as a viewer! Please mute the tab or window instead - you rock!");
}

function discord(target, context, params, client, channelname) {
    client.say(channelname, "Wanna join my Discord family? Click here: https://discord.gg/E2zvvhn");
}

function newsub(target, context, params, client, channelname) {
    client.say(channelname, "Thank you for subbing to the channel, it's very much appericated millie4Love millie4Hype millie4Cute. For a list of subperks that will be available, you can either use the command !subperks or view them in Milliebug's discord here: https://discord.gg/E2zvvhn");
}

function subperks(target, context, params, client, channelname) {
    client.say(channelname, `${context.username} for subbing to Milliebug you get some wonderful perks:`);
    client.say(channelname, `Access to some super cute emotes millie4Hype millie4Cute millie4Love`); //add more emotes later
    client.say(channelname, `An amazing sub badge on twitch`);
    client.say(channelname, `Special discord role and sub chat (https://discord.gg/E2zvvhn)`);
    client.say(channelname, `Ability to play games with the amazing Milliebug herself`);
    client.say(channelname, `and a special perk if you stay for 3 months: real sub BADGES and emote STICKERS`);
}


//This is a nice to have function it will convert the method string
//from the onsubhandlers to something more readable for the user
function subPlanConverter(methodplan) {
    switch (methodplan) {
        case '1000':
            return "TIER 1";
        case '2000':
            return "TIER 2";
        case '3000':
            return "TIER 3";
        default:
            return `Cannot find the plan ${methodplan}`;
    }
}
