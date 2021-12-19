require("dotenv").config();
var fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const RedditAPI = require("./RedditAPI");

const { BOT_KEY } = process.env;
const user_config = JSON.parse(fs.readFileSync("user_config.json"));

const bot = new TelegramBot(BOT_KEY, { polling: true });
const reddit = new RedditAPI();

let timer = null;

const sendPost = async (msg) => {
  console.log(`${new Date().toLocaleString()} Fetching subreddit posts`);

  const fetchedPosts = await reddit.fetchSubredditPosts(user_config.subreddit, {
    sort: user_config.sort,
  });
  const { postIds, posts } = fetchedPosts;

  const latestPostId = postIds[0];
  const latestPostDetails = posts[latestPostId];

  const {
    id,
    title,
    permalink,
    source: { url },
  } = latestPostDetails;

  // const redditLink = `https://www.reddit.com/r/${user_config.subreddit}/comments/${id}`;
  bot.sendMessage(
    msg.chat.id,
    `${latestPostDetails.title}\nSource: ${url}\n\nReddit: ${permalink}`
  );
};

bot.onText(/\/start/, async (msg) => {
  await sendPost(msg);

  timer = setInterval(async () => {
    await sendPost(msg);
  }, user_config.notifyInterval * 60000);
});

bot.onText(/\/stop/, (message) => {
  clearInterval(timer);
});
