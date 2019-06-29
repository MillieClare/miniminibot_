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
};

function twitter(target, context, params, client, channelname) {
    client.say(channelname, "You can follow Millie on Twitter www.twitter.com/_Milliebug_ !");
}

function raid(target, context, params, client, channelname) {
    client.say(channelname, "Sub message:");
    client.say(channelname, "millie4Hype millie4Hype MINI RAID millie4Hype millie4Hype");
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
    client.say(channelname, "TwitchUnity millie4Minihype MorphinTime millie4Minihype KAPOW millie4Minihype MorphinTime millie4Minihype TwitchUnity millie4Minihype TwitchUnity millie4Minihype MorphinTime millie4Minihype KAPOW millie4Minihype MorphinTime millie4Minihype TwitchUnity");
}

function lurk(target, context, params, client, channelname) {
    client.say(channelname, "Lurk mode activated! Remember that when you mute a stream you do not count as a viewer! Please mute the tab or window instead - you rock!");
}

function discord(target, context, params, client, channelname) {
    client.say(channelname, "Wanna join my Discord family? Click here: https://discord.gg/E2zvvhn");
}
