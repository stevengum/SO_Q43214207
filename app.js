/**
 * StackOverflow Question 43214207
 * http://stackoverflow.com/questions/43214207/botframework-is-it-possible-to-combine-luis-intents-and-normal-intents
 */

const builder = require('botbuilder'); 
const restify = require('restify');

let server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

let connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post('/api/messages', connector.listen());

let bot = new builder.UniversalBot(connector);

// We're going to use the two IntentRecognizers 'LuisRecognizer' and 'RegExpRecognizer'.

let pizzaRecognizer = new builder.LuisRecognizer('YOUR-LUIS-MODEL');
let mathRecognizer = new builder.RegExpRecognizer('MathHelp', /(^mathhelp$|^\/mathhelp$)/i);

// Now let's create our IntentDialog and configure its options...
// By combining our pizzaRecognizer and mathRecognizer into a list, we can pass this list to our 'recognizers' property so IntentDialog uses both recognizers. 
// The last property we're going to fiddle with is 'recognizerOrder', its default is 'parallel'.
// By changing the value to 'series', the IntentDialog will now trigger our RegExpRecognizer 'mathRecognizer' first.
// If a match with a score of 1 exists, the LuisRecognizer will not be used, saving a wasted LUIS endpoint hit.

let intents = new builder.IntentDialog({ recognizers: [mathRecognizer, pizzaRecognizer], recognizeOrder: 'series' })
    .onDefault([
        (session, args) => {
            console.log(args);
            session.send('This bot is for demonstrating the incorporation of multiple intentrecognizers via usage of IntentDialog().');
            session.endDialog('By typing in \'MathHelp\' or \'/MathHelp\' you can access the MathHelpDialog. You can also say things like \'I want to make a pizza\' or \'make a pizza\' to get to the MakePizzaDialog.');
        }
    ]);

// Created separate dialogs as opposed to storing waterfalls inside of intents.matches. 
// This way, we can use session.beginDialog() to move between dialogs normally triggered by LUIS or RegExp when creating new child dialogs. 

intents.matches('MakePizza', 'MakePizzaDialog');
intents.matches('MathHelp', 'MathHelpDialog');

bot.dialog('/', intents);

bot.dialog('MakePizzaDialog', (session, args) => {
    console.log(args);
    session.endDialog('Hi! I\'d love to help you make a pizza, but I don\'t have any arms! :(');
});

bot.dialog('MathHelpDialog', (session, args) => {
    console.log(args);
    session.endDialog('I left my calculator at home... Sorry!');
});