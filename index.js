"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();

bot.dialog('/', intents);

intents.matches(/^改名/i, [
    function(session) {
        session.beginDialog('/profile');
    },
    function(session, result) {
        session.send('好... 把你的名字改成 %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {
        if(!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, result) {
        session.send('Hi 親愛的%s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! 你叫啥？');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

// bot.dialog('/', function (session) {
//     console.warn('Bingo!');
//     session.send('You said ' + session.message.text);
// });

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
