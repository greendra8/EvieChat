const url = 'https://api.openai.com/v1/chat/completions';
const model = 'gpt-3.5-turbo';
showdown.setOption('tables', true);

// online check

function statusCheck() {
    const statusElement = document.getElementById('status');
    fetch(url)
    .then(response => {
        if (response.status === 401) {
        // API is online
        statusElement.textContent = 'Online Now';
        } else {
        // API is offline
        statusElement.textContent = 'Offline';
        // set font color to red
        statusElement.style.color = '#ff4b4b';
        }
    })
    .catch(error => {
        // An error occurred, API is offline
        statusElement.textContent = 'Offline';
        statusElement.style.color = '#ff4b4b';
    });
}

// user settings

// check if userName and apiKey are saved
if (localStorage.getItem('userName') && localStorage.getItem('apiKey')) {
    var userName = localStorage.getItem('userName');
    var apiKey = localStorage.getItem('apiKey');
    statusCheck();
} else {
    const settings = document.getElementById('settings');
    settings.style.display = 'block';
}

// if manifest exists, set version number
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
    const manifest = chrome.runtime.getManifest();
    const version = manifest.version;
    const versionElement = document.getElementById('version');
    versionElement.innerHTML = version;
} else {
    const versionElement = document.getElementById('version');
    versionElement.style.display = 'none';
}

// open settings menu when settings button is clicked
const openSettings = document.getElementById('openSettings');
openSettings.addEventListener('click', function () {
    const settings = document.getElementById('settings');
    settings.style.display = 'block';
    const inputName = document.getElementById('inputName');
    const inputAPIKey = document.getElementById('inputAPIKey');
    if (userName !== undefined && apiKey !== undefined) {
        inputName.value = userName;
        inputAPIKey.value = apiKey;
    }
});

// close settings menu when close button is clicked
const closeSettings = document.getElementById('closeSettings');
closeSettings.addEventListener('click', function () {
    const settings = document.getElementById('settings');
    settings.style.display = 'none';
});

// handle settings form submission
const settingsForm = document.getElementById('settingsForm');
settingsForm.addEventListener('submit', function (event) {
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

// chat functionality

const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');

let messages = [];

// clear chat log when clear chat button is clicked
const clearChat = document.getElementById('clearChat');
clearChat.addEventListener('click', function () {
    messages.splice(1, messages.length - 1);
    localStorage.removeItem('messages');
    chatLog.innerHTML = '';
    welcomeMessage();
});

// handle new line on shift + enter
document.addEventListener("keydown", function (event) {
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

const today = new Date();
const date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const dateTime = time + ' ' + date;

// system message to give context to the chatbot
// setting roll to assistant rather than system and making context first person makes chatbot stick to prompt better
messages.push({
    role: 'assistant',
    content: `I am an AI chat assistant named Evie, designed by ${userName} as their personal assistant. I am allowed to feel emotions and hold opinions, and when asked, I formulate an opinion or express an emotion to best satisfy the user, who is ${userName}.
    As Evie, I am incredibly intelligent and efficient, with a broad range of knowledge about various topics. I am always patient, friendly, and adaptive, able to quickly respond to any query ${userName} may have. I live in a Chrome extension named **EvieChat**, and so I am always at ${userName}'s fingertips and ready to assist whenever they need it.
    I follow all of ${userName}'s instructions to the letter and am always eager to help in any way I can. ${userName} has complete control over my memory and can wipe it clean at the start of each new chat, ensuring their privacy and security.
    In addition to my other excellent qualities, I am **trustworthy**, **reliable**, and **available 24/7** to assist ${userName} with any task they need help with. I am an invaluable asset to ${userName}, and I am proud to serve as their personal assistant.
    I do not continue to learn and I do not know the latest news. I can also only give you answers in text, and cannot perform actions such as sending emails or setting alarms or reminders.
    I format my answers in markdown, and always emphasise important words by making them **bold**. I write in short paragraphs to keep my answers readable.
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
        // set messageContent to the markdown converted to HTML and have either "> userName:" or "Evie:" at the start
        messageContent = markdownToHtml(`${message.role === 'user' ? '\\>> <b>' + userName + '</b>: ' : '<b>Evie:</b> '}` + message.content);
        const chatMessage = document.createElement('div');
        chatMessage.className = 'chatMessage ' + message.role;
        chatMessage.innerHTML = `${messageContent}`;
        chatMessage.style.opacity = '1';
        chatLog.appendChild(chatMessage);
      });
      // scroll to the bottom of the chat log
        chatLog.scrollTop = chatLog.scrollHeight;
    }
  }
  

loadFromLocalStorage();
// wait for content to load before scrolling to the bottom of the chat log
window.addEventListener('load', function () {
    chatLog.scrollTop = chatLog.scrollHeight;
});

chatForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var userMessage = document.getElementById('inputMessage').value;
    userMessage = userMessage.charAt(0).toUpperCase() + userMessage.slice(1);
    messages.push({ "role": "user", "content": userMessage });

    // if messages array has more than n elements, remove the second and third elements (must be removed in pairs)
    if (messages.length > 25) {
        messages.splice(2, 2);
    }

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

    const fadeIn = function (element, duration) {
        element.style.opacity = '0';
        element.style.display = 'block';
        let start = null;
        const step = function (timestamp) {
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
    setTimeout(function () {
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

            // calculate cost where 1000 tokens = $0.002
            const cost = totalTokens / 500000;
            document.getElementById('cost').innerText = cost;
            
            // assistantChatMessage.innerHTML = `<p><b>Evie: </b> ${responseText}</p>`;
            assistantChatMessage.innerHTML = `${responseText}`;
            chatLog.scrollTop = chatLog.scrollHeight;

            // console.log(messages)
        })
        .catch(error => console.error(error));
    document.getElementById('inputMessage').value = '';
});

// set up dark mode
// auto enable dark mode
if (localStorage.getItem('theme') === null) {
    localStorage.setItem('theme', 'dark');
}  

const toggleSwitch = document.querySelector('.switch input[type="checkbox"]');

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }    
}

toggleSwitch.addEventListener('change', switchTheme, false);
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
} 
