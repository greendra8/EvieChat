# EvieChat

![EvieChat Screenshot](https://i.imgur.com/dtSnzdz.png)

Evie is a simple ChatGPT chrome extension assistant. It uses the OpenAI API to handle requests, and serves users through a simple and clean interface.

Users can also clear the chat history, as well as keep track of their API expenditure.  

If message chains get longer than 25 messages, the first messages will be removed, 2 at a time. This can be changed by the developer in `browser_action.js`. The initial system message is always kept so that the bot can remain on task.

Evie is subject to all of the usual bias, limitations, and hallucinations of the normal ChatGPT.

## Installation
If you would like to use Evie yourself, the setup is simple.

1. Download [latest release](https://github.com/greendra8/EvieChat/releases) and unzip
2. Go to your browser extensions page
3. Enable developer mode
4. Drag the folder inside the unzipped folder onto the page

If you would like to customise things further, you can edit the `browser_action.js` file.

