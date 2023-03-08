const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = 3000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());

app.post('/api/ai', async (req, res) => {
  const userInput = req.body.userInput;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: userInput}],
  });

  const response = completion.data.choices[0].text;
  res.json({ response });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
