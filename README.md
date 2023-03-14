# EvieChat

![EvieChat Screenshot](https://i.imgur.com/cedXQr9.png)

Evie is a simple ChatGPT chrome extension assistant. It uses the OpenAI API to handle requests, and serves users through a simple and clean interface.

Evie is subject to all of the usual bias, limitations, and hallucinations of the normal ChatGPT.

## Features

- Refined Evie personality through detailed hidden system prompt
- API expenditure tracking
- API outage detection
- Persistent chat history
- Light and dark themes
- Syntax highlighting
- LaTex support
- Hotkey support (Ctrl + Space to open)

If message chains get longer than 25 messages, the first messages will be removed, 2 at a time. This reduces the number of tokens sent per request and therefore reduces expenditure. This value can be changed by the developer in `browser_action.js`. Note that the initial system message is always kept so that Evie can remember her instructions and remain on task.


## Installation
If you would like to use Evie yourself, the setup is simple.

1. Download [latest release](https://github.com/greendra8/EvieChat/releases) and unzip
2. Go to your browser extensions page
3. Enable developer mode
4. Drag the folder inside the unzipped folder onto the page

If you would like to customise things further, you can edit the `browser_action.js` file.

