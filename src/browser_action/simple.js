const apiKey = "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";
const chatUrl = "https://api.openai.com/v1/chat/completions";

const generateChat = async () => {
  // Get the chat input messages from the user
  const messages = [
    { role: 'system', content: 'You are a GPT-3.5 chat assistant.' }
  ];

  // Set the request headers
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${apiKey}`);

  // Set the request body
  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.7,
    n: 1,
    stream: true,
    max_tokens: 100,
    presence_penalty: 0,
    frequency_penalty: 0
  });

  // Send the POST request to the ChatGPT API
  const response = await fetch(chatUrl, {
    method: "POST",
    headers,
    body
  });

  // Parse the response as a stream of server-sent events
  const eventSource = new EventSource(response.body);

  // Update the chat output as new messages come in
  const chatOutput = document.getElementById("chat-output");
  eventSource.onmessage = event => {
    const data = JSON.parse(event.data);
    if (data.text) {
      chatOutput.innerHTML += `<p><strong>${data.user}:</strong> ${data.text}</p>`;
    }
  };
};

// Add a click event listener to the "Generate Chat" button
const generateChatButton = document.getElementById("generate-chat");
generateChatButton.addEventListener("click", generateChat);

// Define a function to handle the server-sent events
function handleStream(event) {
  // Check if the stream has ended
  if (event.data === '[DONE]') {
    streamController.close();
    return;
  }
  // Handle the incoming data
  console.log(event.data);
}

// Create a new ReadableStream object
const stream = new ReadableStream({
  start: (controller) => {
    // Save the controller to close the stream later
    streamController = controller;
    // Make a request to the API
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            text: 'Hello, how are you?',
            user: 'user-1',
          },
        ],
        n: 1,
        stop: ['\n'],
        stream: true,
      }),
    })
      .then((response) => {
        // Check if the response was successful
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Set up the server-sent event listener
        const eventSource = new EventSource(response.url);
        eventSource.onmessage = handleStream;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  },
});

