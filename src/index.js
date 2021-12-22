require("dotenv").config();
var fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const RedditAPI = require("./RedditAPI");

const { BOT_KEY } = process.env;
let { subreddit, sort, notifyInterval } = JSON.parse(
  fs.readFileSync("user_config.json")
);

const bot = new TelegramBot(BOT_KEY, { polling: true });
const reddit = new RedditAPI();

let sentPosts = {};
let timer = null;

// To show brief info about subreddit, sort, interval
const showUpdatesInfo = (message) => {
  bot.sendMessage(
    message.chat.id,
    `🔥 Now sending updates of <b>${sort}</b> posts from\n<b>r/${subreddit}</b> every <b>${notifyInterval} min</b>`,
    { parse_mode: "HTML" }
  );
};
// To fetch unique and valid post from subreddit
const fetchPostToSend = async () => {
  console.log(
    `${new Date().toLocaleString()} Fetching posts from ${subreddit}`
  );
  const fetchedPosts = await reddit.fetchSubredditPosts(subreddit, {
    sort,
    limit: 5,
  });
  const { postIds, posts } = fetchedPosts;

  // removing ads, promoted posts
  let filteredPostIds = postIds.filter((id) => id.length < 15);
  // find post to sent
  let uniquePostId = null;
  for (let postId of filteredPostIds) {
    // skip pinned post
    if (posts[postId].isStickied) continue;
    // skip if already sent
    if ((sentPosts[subreddit] || []).includes(postId)) continue;

    uniquePostId = postId;
    break;
  }

  return { uniquePostId, posts };
};
// To contruct post template message to be sent
const generatePostTemplate = (postDetails) => {
  // extract details
  const { id, title, permalink } = postDetails;
  // Other details
  let type = (postDetails.media || {}).type || "link";
  const url = (postDetails.source || {}).url;
  const preview = (postDetails.preview || {}).url;

  // meaningful type rename
  if (type === "rtjson") type = "text";
  // capitalize first letter of type
  type = type.charAt(0).toUpperCase() + type.slice(1);
  // check if post contains media
  const isMediaPost =
    type === "Image" || type === "Video" || type === "Gallery" ? true : false;

  let typeString = type ? `\n➡️ Post type: ${type}` : "";
  const urlString = url && !isMediaPost ? `\n🌐 Source: ${url}` : "";

  // generate preview only if media available
  const previewString =
    preview && isMediaPost
      ? `\n<a href="${preview}">👀 Preview thumbnail</a>`
      : "";

  const postTemplate = `<b>${title}</b>\n\n🚩 r/${subreddit}${typeString}${urlString}${previewString}\n\n<a href="${permalink}">🔴 ${
    isMediaPost ? "View media" : "View on reddit"
  }</a>`;
  return postTemplate;
};
// To fetch and send fetched post
const sendPost = async (message) => {
  const { uniquePostId, posts } = await fetchPostToSend();

  if (uniquePostId === null) {
    console.log("No new posts left to send!\n--------------------------------");
  } else {
    console.log(`Preparing to send ${uniquePostId}`);
    const postDetails = posts[uniquePostId];

    const postMsgTemplate = generatePostTemplate(postDetails);
    bot.sendMessage(message.chat.id, postMsgTemplate, {
      parse_mode: "HTML",
    });
    // register post as sent
    // index subreddit if not indexed
    if (!sentPosts[subreddit]) sentPosts[subreddit] = [];
    sentPosts[subreddit].push(uniquePostId);
    console.log("Post sent to bot\n--------------------------------");
  }
};
// To SetInterval for sending posts at intervals
const startUpdatesInterval = async (message) => {
  // Remove any previous intervals to prevent multiple setIntervals
  clearInterval(timer);
  // Show info whenever fresh intervals are set
  showUpdatesInfo(message);
  // Start sending updates
  await sendPost(message);

  timer = setInterval(async () => {
    await sendPost(message);
  }, notifyInterval * 60000);
};

// Bot commands
bot.onText(/\/start/, async (message) => {
  await startUpdatesInterval(message);
});

bot.onText(/\/help/, (message) => {
  bot.sendMessage(
    message.chat.id,
    `/start - start getting updates
/stop - stop getting updates
/subreddit - Change the subreddit. send the subreddit's name along with this command
/sort - Change the sort type. hot, new, rising, send post sort type along with this command
/help - show all commands`,
    { parse_mode: "HTML" }
  );
});

bot.onText(/\/stop/, (message) => {
  // Stop sending updates
  clearInterval(timer);
  console.log("Bot stopped");
});

bot.onText(/\/subreddit (.+)/, async (message, match) => {
  const newSubredditName = match[1];
  // Check if new subreddit name different
  if (newSubredditName === subreddit) {
    bot.sendMessage(
      message.chat.id,
      `😴No update needed. Current subreddit already set to ${subreddit}`
    );
  } else if (newSubredditName) {
    // Check if subreddit exists
    const isValid = await reddit.isValidSubreddit(newSubredditName);
    if (isValid) {
      // Stop previous subreddit interval
      clearInterval(timer);
      subreddit = newSubredditName;
      bot.sendMessage(message.chat.id, `✅Subreddit updated`, {
        parse_mode: "HTML",
      });
      // Start interval updates from new subreddit
      await startUpdatesInterval(message);
    } else {
      bot.sendMessage(
        message.chat.id,
        `⚠️This subreddit doesnt exist, please check the name again.`
      );
    }
  }
});

bot.onText(/\/sort (.+)/, async (message, match) => {
  // Change sortType of posts
  // Prompt available sort types
  const availableSorts = ["hot", "new", "rising"];

  const newSortType = match[1];
  // check if new sort different then current
  if (newSortType === sort) {
    bot.sendMessage(
      message.chat.id,
      `😴No update needed. Current sort type already set to ${sort}`
    );
  } else if (newSortType) {
    if (
      newSortType.toLowerCase() == "hot" ||
      newSortType.toLowerCase() == "new" ||
      newSortType.toLowerCase() == "rising"
    ) {
      sort = newSortType;
      bot.sendMessage(message.chat.id, `✅Sort type updated`);
      await startUpdatesInterval(message);
    } else {
      bot.sendMessage(
        message.chat.id,
        `⚠️Invalid sort type. Available sort types are ${availableSorts.join(
          ", "
        )}`
      );
    }
  }
});
