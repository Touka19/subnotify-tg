require("dotenv").config();
var fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");

const { BOT_KEY } = process.env;
var user_config = JSON.parse(fs.readFileSync("user_config.json"));

const bot = new TelegramBot(BOT_KEY, { polling: true });

let timer = null;

bot.onText(/\/start/, (msg) => {
  timer = setInterval(() => {
    // console.log(msg);
    bot.sendMessage(msg.chat.id, "hello");
  }, user_config.interval);
});

bot.onText(/\/stop/, (message) => {
  clearInterval(timer);
});
