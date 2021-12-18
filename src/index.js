require("dotenv").config();
var fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

const { BOT_KEY } = process.env;
var user_config = JSON.parse(fs.readFileSync("user_config.json"));

const bot = new TelegramBot(BOT_KEY, { polling: true });

// sample: reply back with same message
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const replyMsg = msg.text;

  // send reply
  bot.sendMessage(chatId, replyMsg);
});
