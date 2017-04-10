# Stack Overflow 43214207

## [BotFramework : is it possible to combine LUIS intents and normal intents?](http://stackoverflow.com/questions/43214207/botframework-is-it-possible-to-combine-luis-intents-and-normal-intents)

> I'm currently taking my first steps into chatbots with the Microsoft Botframework for NodeJS. <br/><br/> 
I've so far seen 'normal' intents and LUIS.ai intents <br/><br/>
Is it possible to combine the two? <br/><br/>
I've had an .onDefault intent that wasn't a LUIS one and a LUIS intent but no matter what the input was it always returned the output of the LUIS intent.<br/><br/>
Could someone give me a quick example or point me to one?<br/><br/>
Thanks in advance

___

It is possible to combine LUIS intents and normal intents. To do this we'll use two IntentRecognizers; [LuisRecognizer](https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.luisrecognizer.html) and [RegExpRecognizer](https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.regexprecognizer.html).

    let pizzaRecognizer = new builder.LuisRecognizer('YOUR-LUIS-MODEL');
    let mathRecognizer = new builder.RegExpRecognizer('MathHelp', /(^mathhelp$|^\/mathhelp$)/i);

Now let's create our [IntentDialog](https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentdialog.html) and configure its [options](https://docs.botframework.com/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentdialogoptions.html)...

    let intents = new builder.IntentDialog({ recognizers: [mathRecognizer, pizzaRecognizer], recognizeOrder: 'series' })

By combining our pizzaRecognizer and mathRecognizer into a list, we can pass this list to our 'recognizers' property so IntentDialog uses both recognizers. The last property we're going to fiddle with is 'recognizerOrder', its default is 'parallel'. By changing the value to 'series', the IntentDialog will now trigger our RegExpRecognizer 'mathRecognizer' first. If a match with a score of 1 exists, the LuisRecognizer will not be used, saving a wasted LUIS endpoint hit.

I would like to reiterate, if you are trying to use RegExpRecognizers to try and reduce the amounts of LUIS calls your chatbot makes, you need to pass in those recognizers first to your recognizers list. Then you need to set your `recognizerOrder` to `'series'`. Without setting your order to series, your chatbot will continue to perform LUIS calls. Also note that any matched intent must have a score of 1.0 to prevent the other recognizers from being employed. To encourage perfect matches, you should use the RegExp quantifiers `^` and `$` to define clear start and ending points for your patterns to match against. (See `mathRecognizer` for an example)

If speed is your primary priority, then you should not change the value of `'recognizerOrder'`, which will then employ all the recognizers at once.

I've built an example [here](https://github.com/stevengum97/SO_Q43214207) for you to examine. 