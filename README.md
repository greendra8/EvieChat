# EvieChat

![EvieChat Screenshot](https://i.imgur.com/GW9mfti.png)

## Developer notes
Evie is a simple implementation of the OpenAI API into a chrome extension. It has a simple to use interface where you can interact with the chat bot, as well as a clear chat button and a counter to keep track of how much you have spent.

If message chains get longer than 25 messages, the first messages will be removed, 2 at a time. This can be changed by the developer in `browser_action.js`. The initial system message is always kept so that the bot can remain on task.

## Installation
If you would like to use Evie yourself, the setup is simple.

1. Clone the repository
2. Create a file inside src/browser_action called `config.js`
3. Get your OpenAI API key from [here](https://platform.openai.com/account/api-keys)
4. Add the following code to the file:
```javascript 
var config = {
    NAME: 'YOUR_NAME',
    MY_KEY : 'YOUR_KEY'
  }
```
4. Go to your browser extensions page
5. Enable developer mode
6. Drag the root folder onto the page


