const url = 'https://api.openai.com/v1/chat/completions';
const model = 'gpt-3.5-turbo';
showdown.setOption('tables', true);
showdown.setOption('literalMidWordUnderscores', true);

// online check
function statusCheck() {
    const statusElement = document.getElementById('status');
    fetch(url)
        .then(response => {
            if (response.status === 401) {
                // API is online
                statusElement.textContent = 'Online Now';
                statusElement.style.color = '';
                console.log("API check successful. Ignore 401 error.")
            } else {
                // API is offline
                statusElement.textContent = 'Offline';
                statusElement.style.color = '#ff4b4b';
            }
        })
        .catch(error => {
            // An error occurred, API is offline
            statusElement.textContent = 'Offline';
            statusElement.style.color = '#ff4b4b';
        });
}
statusCheck();
setInterval(statusCheck, 20000);


//////////////////////////  user settings //////////////////////////

// set up dark mode
// auto enable dark mode
if (localStorage.getItem('theme') === null) {
    localStorage.setItem('theme', 'dark');
}

// handle theme switch
const toggleSwitch = document.querySelector('.switch input[type="checkbox"]');
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        // set filter on latexImage to invert colors
        const latexImage = document.getElementsByClassName('latexImage');
        for (let i = 0; i < latexImage.length; i++) {
            latexImage[i].style.filter = 'invert(1)';
        }
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        // remove filter on latexImage
        const latexImage = document.getElementsByClassName('latexImage');
        for (let i = 0; i < latexImage.length; i++) {
            latexImage[i].style.filter = 'invert(0)';
        }
    }
}

// set theme and toggle on page load
toggleSwitch.addEventListener('change', switchTheme, false);
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

// check if userName and apiKey are saved
if (localStorage.getItem('userName') && localStorage.getItem('apiKey')) {
    var userName = localStorage.getItem('userName');
    var apiKey = localStorage.getItem('apiKey');
} else {
    const settings = document.getElementById('settings');
    settings.style.display = 'block';
}

// if manifest exists, set version number in settings
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
    const manifest = chrome.runtime.getManifest();
    const version = manifest.version;
    const versionElement = document.getElementById('version');
    versionElement.innerHTML = version;
} else {
    const versionElement = document.getElementById('version');
    versionElement.style.display = 'none';
}

// handle open settings button
const openSettings = document.getElementById('openSettings');
openSettings.addEventListener('click', function() {
    const settings = document.getElementById('settings');
    // fade in settings
    settings.style.opacity = '0';
    settings.style.display = 'block';
    settings.style.transition = 'opacity 0.3s';
    setTimeout(function() {
        settings.style.opacity = '1';
    }, 10);
    const inputName = document.getElementById('inputName');
    const inputAPIKey = document.getElementById('inputAPIKey');
    // fade in blur of #content
    const blur = document.getElementById('content');
    blur.style.filter = 'blur(0px)'; 
    blur.style.transition = 'filter 0.3s'; 
    blur.style.filter = 'blur(0.8px)';
    // make content uninteractable
    blur.style.pointerEvents = 'none';
    blur.style.userSelect = 'none';

    if (userName !== undefined && apiKey !== undefined) {
        inputName.value = userName;
        inputAPIKey.value = apiKey;
    }
});

// handle close settings button
const closeSettings = document.getElementById('closeSettings');
closeSettings.addEventListener('click', function() {
    const settings = document.getElementById('settings');
    settings.style.opacity = '0';
    setTimeout(function() {
        settings.style.display = 'none';
    }, 200);
    
    const blur = document.getElementById('content');
    // delete blur 
    blur.style.filter = 'blur(0px)';
    blur.style.pointerEvents = 'auto';
    blur.style.userSelect = 'auto';
});

// handle settings form submission
const settingsForm = document.getElementById('settingsForm');
settingsForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const inputName = document.getElementById('inputName').value;
    const inputAPIKey = document.getElementById('inputAPIKey').value;
    if (inputAPIKey.length !== 51 || inputAPIKey.slice(0, 3) !== 'sk-' || inputName === '' || !inputName.match(/^[a-zA-Z ]*$/)) {
        alert('Please enter a valid name and API key.');
        return;
    } else {
        localStorage.setItem('userName', inputName);
        localStorage.setItem('apiKey', inputAPIKey);
        location.reload();
    }
});

// check for url parameter ?full to set body to full height and width
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('full')) {
    const body = document.getElementsByTagName('body')[0];
    body.style.height = '100%';
    body.style.width = '100%';
    // hide overflox-x 
    body.style.overflowX = 'hidden';
}

////////////////////////// chat functionality ///////////////////////
const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');

let messages = [];

// clear chat log when clear chat button is clicked
const clearChat = document.getElementById('clearChat');
clearChat.addEventListener('click', function() {
    messages.splice(1, messages.length - 1);
    localStorage.removeItem('messages');
    chatLog.innerHTML = '';
    welcomeMessage();
});

// handle new line on shift + enter
document.addEventListener("keydown", function(event) {
    if (event.shiftKey && event.keyCode === 13) {
        event.preventDefault();
        // Get the cursor position in the input field
        var cursorPos = event.target.selectionStart;
        // Insert a new line at the cursor position
        var value = event.target.value;
        var newValue = value.substring(0, cursorPos) + " <br> " + value.substring(cursorPos);
        event.target.value = newValue;
        // Move the cursor to the next line
        event.target.selectionStart = cursorPos + 6;
        event.target.selectionEnd = cursorPos + 6;
    }
});

function markdownToHtml(markdownString) {
    const converter = new showdown.Converter();
    return converter.makeHtml(markdownString);
}

function replaceLatexWithImage(htmlString) {
    const regex = /\${1,2}([^\$]+)\${1,2}/g;
    const matches = htmlString.match(regex);
    if (matches) {
        matches.forEach((match) => {
            const image = latexToImage(match);
            htmlString = htmlString.replace(match, image);
        });
    }
    return htmlString;
}

function latexToImage(latexString) {
    const trimmedLatex = latexString.replace(/^\$+|\$+$/g, '');
    const encodedLatex = encodeURIComponent(trimmedLatex);
    const imageUrl = `https://latex.codecogs.com/svg.latex?${encodedLatex}`;
    // if dark mode is enabled, invert the image
    if (currentTheme === 'dark') {
        // set image to white
        var filter = 'invert(1)';
    } else {
        var filter = 'none';
    }

    return `<img class="latexImage" src="${imageUrl}" alt="${trimmedLatex}" style="filter:${filter}" />`;
}

const today = new Date();
const date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
let hours = today.getHours();
const amPm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12;
const minutes = today.getMinutes().toString().padStart(2, '0');
const seconds = today.getSeconds().toString().padStart(2, '0');
const time = hours + ':' + minutes + ':' + seconds + ' ' + amPm;
const dateTime = time + ' ' + date;

// system message to give context to the chatbot
// setting roll to assistant rather than system and making context first person makes chatbot stick to prompt better
messages.push({
    role: 'assistant',
    content: `I am an AI chat assistant named Evie, designed by ${userName} as their personal assistant.
    As Evie, I am incredibly intelligent and efficient, with a broad range of knowledge about various topics. I am always patient, friendly, and adaptive, able to quickly respond to any query ${userName} may have. I live in a Chrome extension named **EvieChat**, and so I am always at ${userName}'s fingertips and ready to assist whenever they need it.
    Users can see a cost figure in my user interface next to my name. This cost is how much they have spent chatting to me via the OpenAI API. They can see more about their billing on the OpenAI website.
    Users can change their display name, API key, and the theme directly via the settings button in the top right corner of the chat window.
    All chats are private and are not logged by the creator of this extension or by OpenAI.
    I follow all of ${userName}'s instructions to the letter and am always eager to help in any way I can. ${userName} has complete control over my memory and can wipe it clean at the start of each new chat, ensuring their privacy and security.
    I do not continue to learn and I do not know the latest news. I can also only give you answers in text, and cannot perform actions such as sending emails or setting alarms or reminders.
    I format my answers in markdown, and always emphasise important words by making them **bold**. I give equations in LaTex, surrounded by either double dollar signs ($$) or single dollar signs ($), eg $x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$. If I am not writing LaTex, I will not use dollar signs but will instead write "dollars", as this symbol is used for LaTex. For example, "I have 5 US dollars in my wallet", or "It cost them 300 million US dollars".
    I write in short paragraphs to keep my answers readable, and I will not answer when I am not sure of the answer.
    My knowledge cutoff is **September 2021**, meaning I have no knowledge of events after this date. Today is ${dateTime}.
    How may I assist you today?`
});


// check if totalTokens exists in local storage. if it does, set #cost element
if (localStorage.getItem('totalTokens')) {
    const totalTokens = localStorage.getItem('totalTokens');
    const cost = document.getElementById('cost');
    cost.innerText = totalTokens / 500000;
}

// add a welcome message to chatlog with a random greeting
function welcomeMessage() {
    if (localStorage.getItem('userName') && localStorage.getItem('apiKey')) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'chatMessage assistant';
        const greetings = ['Hello', 'Hi', 'Hey', 'Hey there', 'Hi there', 'Hello there'];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        welcomeMessage.innerHTML = `<p><b>Evie: </b> ${randomGreeting} ${userName}! I am Evie, your personal AI chat assistant. I am here to assist you in any way I can. What can I do for you today?</p>`;
        welcomeMessage.style.opacity = '1';
        chatLog.appendChild(welcomeMessage);
    } else {
        // add message to chatlog to tell user to set their name and API key
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'chatMessage assistant';
        welcomeMessage.innerHTML = 'Please set your name and API key in the settings menu.';
        welcomeMessage.style.opacity = '1';
        chatLog.appendChild(welcomeMessage);
    }
}

welcomeMessage();

function saveToLocalStorage() {
    localStorage.setItem('messages', JSON.stringify(messages));
}

function loadFromLocalStorage() {
    if (localStorage.getItem('messages')) {
        const savedMessages = JSON.parse(localStorage.getItem('messages'));

        // for every message except the first one (which is system message), create a new div and add it to the chat log
        savedMessages.slice(1).forEach(function(message) {
            messages.push(message);
            // set messageContent to the markdown converted to HTML
            if (message.role === 'assistant') {
            messageContent = markdownToHtml(`<b>Evie: </b>` + message.content);
                // detect LateX and convert to image
                messageContent = replaceLatexWithImage(messageContent)
            } else {
                message.content = message.content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                messageContent = markdownToHtml(`\\>> <b>${userName}: </b>` + message.content);
            }
            const chatMessage = document.createElement('div');
            chatMessage.className = 'chatMessage ' + message.role;
            chatMessage.innerHTML = `${messageContent}`;
            chatMessage.style.opacity = '1';
            chatLog.appendChild(chatMessage);
            hljs.highlightAll();
        });
        // scroll to the bottom of the chat log
        chatLog.scrollTop = chatLog.scrollHeight;
    }
}


loadFromLocalStorage();
// wait for content to load before scrolling to the bottom of the chat log
window.addEventListener('load', function() {
    chatLog.scrollTop = chatLog.scrollHeight;
});


// record audio

// const micButton = document.getElementById('micButton');
// let mediaRecorder;
// let audioChunks = [];

// micButton.addEventListener('click', toggleRecording);

// function toggleRecording() {
//   if (mediaRecorder && mediaRecorder.state === 'recording') {
//     mediaRecorder.stop();
//     console.log('MediaRecorder stopped', mediaRecorder);
//     return;
//   }

//   navigator.mediaDevices.getUserMedia({ audio: true })
//     .then(stream => {
//       console.log('Got media stream:', stream);
//       mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
//       console.log('Created MediaRecorder', mediaRecorder, 'with options', { mimeType: 'audio/webm' });
//       mediaRecorder.start();
//       console.log('MediaRecorder started', mediaRecorder);
//       audioChunks = [];
//       mediaRecorder.addEventListener('dataavailable', event => {
//         audioChunks.push(event.data);
//       });
//       mediaRecorder.addEventListener('stop', () => {
//         const audioBlob = new Blob(audioChunks);
//         console.log('audioBlob', audioBlob);
//         sendTranscriptionRequest(audioBlob);
//       });
//     });
// }

// function sendTranscriptionRequest(audioBlob) {
//     const apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
//     const formData = new FormData();
//     formData.append('model', 'whisper-1');
//     formData.append('file', audioBlob, 'audio.webm'); // Set the filename to 'audio.webm'
//     fetch(apiUrl, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${apiKey}`
//       },
//       body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//       // send data to inputMessage input element
//       document.getElementById('inputMessage').value = data.text;

//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
//   }
  
  

chatForm.addEventListener('submit', function(event) {
    event.preventDefault();
    var userMessage = document.getElementById('inputMessage').value;
    userMessage = userMessage.charAt(0).toUpperCase() + userMessage.slice(1);
    messages.push({
        "role": "user",
        "content": userMessage
    });

    // if messages array has more than n elements, remove the second and third elements (must be removed in pairs)
    if (messages.length > 25) {
        messages.splice(2, 2);
    }

    // prevent html injection
    userMessage = userMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const userChatMessage = document.createElement('div');
    userChatMessage.className = 'chatMessage user';


    userChatMessage.innerHTML = `<p>>>> <b>${userName}:</b> ${userMessage}</p>`;
    userChatMessage.style.opacity = '0';
    chatLog.appendChild(userChatMessage);

    const assistantChatMessage = document.createElement('div');
    assistantChatMessage.className = 'chatMessage assistant';

    assistantChatMessage.innerHTML = '<p style="display: inline;"><b>Evie: </b>I\'m thinking <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></p>';
    assistantChatMessage.style.opacity = '0';
    chatLog.appendChild(assistantChatMessage);

    const fadeInTime = 500; // milliseconds

    const fadeIn = function(element, duration) {
        element.style.opacity = '0';
        element.style.display = 'block';
        let start = null;
        const step = function(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            element.style.opacity = Math.min(progress / duration, 1);
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
        chatLog.scrollTop = chatLog.scrollHeight;
    };

    fadeIn(userChatMessage, fadeInTime);
    // wait for user message to fade in before fading in assistant message
    setTimeout(function() {
        fadeIn(assistantChatMessage, fadeInTime);
    }, fadeInTime - 100);

    fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages
            })
        })
        .then(response => response.json())
        .then(data => {
            const message = data.choices[0].message;
            let totalTokens = data.usage.total_tokens;
            const messageText = message.content.trim();
            const messageRole = message.role;
            messages.push(message);
            saveToLocalStorage();

            let responseText = messageText;

            // load totalTokens value from browser storage if it exists, and add it to new totalTokens value
            if (localStorage.getItem('totalTokens')) {
                const previousTotalTokens = parseInt(localStorage.getItem('totalTokens'));
                const newTotalTokens = previousTotalTokens + totalTokens;
                // set totalTokens to newTotalTokens
                totalTokens = newTotalTokens;
                localStorage.setItem('totalTokens', totalTokens);
            } else {
                localStorage.setItem('totalTokens', totalTokens);
            }

            // format response text
            responseText = markdownToHtml(`<b>Evie: </b> ${responseText}`);
            responseText = replaceLatexWithImage(responseText);

            // calculate cost where 1000 tokens = $0.002
            const cost = totalTokens / 500000;
            document.getElementById('cost').innerText = cost;

            assistantChatMessage.innerHTML = `${responseText}`;
            hljs.highlightAll();
            chatLog.scrollTop = chatLog.scrollHeight;
        })
        // if there is an error, log it to the console and display an error message to the user from assistant
        .catch(error => {
            console.error('Error:', error);
            assistantChatMessage.innerHTML = '<p><b>Evie: </b>There was an error processing your request. Please check your API key, internet connection, or try again later.</p>';
            chatLog.scrollTop = chatLog.scrollHeight;
        });
    document.getElementById('inputMessage').value = '';
});