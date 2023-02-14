const express = require('express');
const line = require('@line/bot-sdk');
const { pipeline } = require("@vitalets/google-translate-api");
const { GPT } = require('gpt-3');
const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

const gpt = new GPT({
  apiKey: process.env.GPT_SECRET,
  model: 'text-davinci-002',
  temperature: 0.7
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/webhook', line.middleware(config), async (req, res) => {
  const events = req.body.events;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (event.type !== 'message' || event.message.type !== 'text') {
      continue;
    }

    if (event.message.text.startsWith('/gpt')) {
      const prompt = event.message.text.slice(4);
      const response = await gpt.complete(prompt);
      const reply = response.data.choices[0].text;
      await client.replyMessage(event.replyToken, { type: 'text', text: reply });
    }
  }

  res.status(200).send('OK');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started');
});
