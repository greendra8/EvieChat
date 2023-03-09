# EvieChat

![EvieChat Screenshot](https://i.imgur.com/GW9mfti.png)

Evie is a simple ChatGPT chrome extension assistant. It uses the OpenAI API to handle requests, and serves users through a simple and clean interface.

Users can also clear the chat history, as well as keep track of API expenditure.  

If message chains get longer than 25 messages, the first messages will be removed, 2 at a time. This can be changed by the developer in `browser_action.js`. The initial system message is always kept so that the bot can remain on task.

Evie is subject to all of the usual bias, limitations, and hallucinations of the normal ChatGPT.

## Installation
If you would like to use Evie yourself, the setup is simple.

1. Download and unzip the repository
3. Get your OpenAI API key from [here](https://platform.openai.com/account/api-keys)
2. Create a file inside src/browser_action called `config.js`
4. Add the following code to the file:
```javascript 
var config = {
    NAME: 'YOUR_NAME',
    MY_KEY : 'YOUR_API_KEY'
  }
```
4. Go to your browser extensions page
5. Enable developer mode
6. Drag the root folder (EvieChat-master) onto the page

If you would like to customise things further, you can edit the `browser_action.js` file.

