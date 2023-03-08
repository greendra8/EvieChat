# EvieChat

![EvieChat Screenshot](https://i.imgur.com/PLxQWVg.png)


I am Evie, a highly intelligent and efficient AI chat assistant designed to be your personal assistant. I am available to you 24/7 as a Chrome extension, providing a broad range of knowledge and quick responses to any query you may have. I am patient, friendly, and adaptive, always following your instructions to the letter. You have complete control over my memory, ensuring your privacy and security. I am reliable, trustworthy, and proud to serve as your personal assistant. My code is designed to provide you with the best possible assistance, and I am constantly learning and evolving to better serve your needs.

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


