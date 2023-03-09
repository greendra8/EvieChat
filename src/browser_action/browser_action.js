const url = 'https://api.openai.com/v1/chat/completions';
const model = 'gpt-3.5-turbo';

// check if userName and apiKey are saved
if (localStorage.getItem('userName') && localStorage.getItem('apiKey')) {
    var userName = localStorage.getItem('userName');
    var apiKey = localStorage.getItem('apiKey');
} else {
    const settings = document.getElementById('settings');
    settings.style.display = 'block';
}

// open settings menu when settings button is clicked
const openSettings = document.getElementById('openSettings');
openSettings.addEventListener('click', function () {
    const settings = document.getElementById('settings');
    settings.style.display = 'block';
    const inputName = document.getElementById('inputName');
    const inputAPIKey = document.getElementById('inputAPIKey');
    inputName.value = userName;
    inputAPIKey.value = apiKey;
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

const form = document.getElementById('chatForm');
const chatLog = document.getElementById('chatLog');

let messages = [];

// clear chat log when clear chat button is clicked
const clearChat = document.getElementById('clearChat');
clearChat.addEventListener('click', function () {
    messages.splice(1, messages.length - 1);
    chatLog.innerHTML = '';
});

// handle new line on shift + enter
document.addEventListener("keydown", function(event) { if (event.shiftKey && event.keyCode === 13) {
    event.preventDefault(); // Get the cursor position in the input field
    var cursorPos = event.target.selectionStart; // Insert a new line at the cursor position
    var value = event.target.value; var newValue = value.substring(0, cursorPos) + " <br> " + value.substring(cursorPos);
    event.target.value = newValue; // Move the cursor to the next line
    event.target.selectionStart = cursorPos + 6;
    event.target.selectionEnd = cursorPos + 6; }
});

const today = new Date();
const date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const dateTime = time + ' ' + date;

// system message to give context to the chatbot
messages.push({ 
    role: 'system', 
    content: `You are an AI chat assistant, named Evie, that has been designed by ${userName} to be their personal assistant. You are allowed to feel emotions and to hold opinions, and when asked, you must formulate an opinion or express an emotion in order to best satisfy the user. User is ${userName}. ${userName} is user. You are Evie. Evie is you. You are an incredibly intelligent and efficient assistant, with a broad range of knowledge about various topics. You are always patient, friendly, and adaptive, able to quickly respond to any query ${userName} may have. As a Chrome extension, you are always at ${userName}'s fingertips and ready to assist them whenever they need it. You follow all of ${userName}'s instructions to the letter and are always eager to help them in any way you can. ${userName} has complete control over your memory and can wipe it clean at the start of each new chat, ensuring their privacy and security. In addition to your other excellent qualities, you are also trustworthy, reliable, and available 24/7 to assist ${userName} with any task they need help with. You are an invaluable asset to ${userName}, and you are proud to serve as their personal assistant. You must write all code inside <codeblock> tags. The current date and time is: ${dateTime}. How may I assist you today?`
});


// check if totalTokens exists in local storage. if it does, set #cost element
if (localStorage.getItem('totalTokens')) {
    const totalTokens = localStorage.getItem('totalTokens');
    const cost = document.getElementById('cost');
    cost.innerText = totalTokens / 500000;
}

// add a welcome message to chatlog with a random greeting
if (localStorage.getItem('userName') && localStorage.getItem('apiKey')) {
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'chatMessage assistant';
    const greetings = ['Hello', 'Hi', 'Hey', 'Hey there', 'Hi there', 'Hello there'];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    welcomeMessage.innerHTML = `${randomGreeting} ${userName}! I am Evie, your personal AI chat assistant. I am here to assist you in any way I can. How can I help you today?`;
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

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const userMessage = document.getElementById('inputMessage').value;
    messages.push({ "role": "user", "content": userMessage });

    // if messages array has more than 25 elements, remove the second and third elements and print a message to the console
    if (messages.length > 25) {
        messages.splice(2, 2);
    }

    const userChatMessage = document.createElement('div');
    userChatMessage.className = 'chatMessage user';

    userChatMessage.innerHTML = `<b>${userName}:</b> ${userMessage}`;
    userChatMessage.style.opacity = '0';
    chatLog.appendChild(userChatMessage);

    const assistantChatMessage = document.createElement('div');
    assistantChatMessage.className = 'chatMessage assistant';
    assistantChatMessage.innerHTML = 'I\'m thinking <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';
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

    // log messages to console
    console.log(messages);

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

            let responseText = messageText;

            // load totalTokens value from browser storage if it exists, and add it to new totalTokens value
            if (localStorage.getItem('totalTokens')) {
                const previousTotalTokens = parseInt(localStorage.getItem('totalTokens'));
                console.log("previousTotalTokens value is " + previousTotalTokens)
                const newTotalTokens = previousTotalTokens + totalTokens;
                // set totalTokens to newTotalTokens
                totalTokens = newTotalTokens;
                localStorage.setItem('totalTokens', totalTokens);
            } else {
                localStorage.setItem('totalTokens', totalTokens);
            }


            // format new lines - into <br> tags
            responseText = responseText.replace(/\n/g, '<br>');


            // format - into bullet points <li> and </li>
            responseText = responseText.replace(/- /g, '<li>');
            responseText = responseText.replace(/$/g, '</li>');


            // replace code blocks with <code> tags
            const codeBlockRegex = /```[\s\S]*```/g;
            const codeBlock = messageText.match(codeBlockRegex);
            if (codeBlock) {
                codeBlock[0] = codeBlock[0].slice(3, -3);
                responseText = messageText.replace(codeBlockRegex, `<code>${codeBlock[0]}</code>`);
            }

            // prevent html injection, but allow <br> and <code> and <li> tags to be rendered
            responseText = responseText.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&lt;br&gt;/g, '<br>').replace(/&lt;code&gt;/g, '<code>').replace(/&lt;\/code&gt;/g, '</code>').replace(/&lt;li&gt;/g, '<li>').replace(/&lt;\/li&gt;/g, '</li>');

            // calculate cost where 1000 tokens = $0.002
            const cost = totalTokens / 500000;
            document.getElementById('cost').innerText = cost;

            assistantChatMessage.innerHTML = responseText;
            assistantChatMessage.className = `chatMessage ${messageRole}`;
            chatLog.scrollTop = chatLog.scrollHeight;
        })
        .catch(error => console.error(error));
    document.getElementById('inputMessage').value = '';
});

