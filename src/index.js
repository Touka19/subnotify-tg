require("dotenv").config();
var fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const RedditAPI = require("./RedditAPI");

const { BOT_KEY } = process.env;
const user_config = JSON.parse(fs.readFileSync("user_config.json"));

const bot = new TelegramBot(BOT_KEY, { polling: true });
const reddit = new RedditAPI();

let timer = null;

bot.onText(/\/start/, (msg) => {
  timer = setInterval(() => {
    // console.log(msg);
    bot.sendMessage(msg.chat.id, "hello");
  }, user_config.notifyInterval);
});

bot.onText(/\/stop/, (message) => {
  clearInterval(timer);
});
