# miniminibot_
My own Twitch bot to run in my channel while streaming, and say hi to people!

It will be written in JavaScript using node.

To Do:

- Set up project ✓
- npm init ✓
- Install the tmi package and require it ✓
- Set up options ✓
- Generate Twitch.tv OAuth token ✓
- Create the connection ✓
- Add event listeners and logic 

Current commands:
!commands - links to a command page that displays all commands that MMB recognises.
!twitter - show a link to my Twitter
!so {user} - say "Thank you {user} for supporting the channel - make sure to show them some love!"
!time - say the local time for me.
!hi - will randomly select a response from a given list
!howareyou - will randomly select a response from a given list
!uptime - how long the stream has been running
!sub
!follow
!hype
!lurk
!discord

For a full list of commands, please visit: https://millieclare.github.io/mmb_commands.html

Commands to be added:
!quotes - MMB will post a quote from a list of pre-given quotes.
!newquote - MMB will store the new quote in the quote list.
!giveawaystart - starts giveaway (MOD ONLY)
!enter - MMB will store username who messages this (the first time only). If subscriber, MMB will add their name x5
!giveawayend - MMB will not store anymore entries (MODONLY)
!decidewinner - MMB will randomly decide the winner (MODONLY)

Timers to be added? (messages that will be posted into chat after an interval of X minutes/messages?)