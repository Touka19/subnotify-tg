# Subreddit Notify

## Description

A telegram bot which sends latest posts of subreddit of your choice. According to the set interval the bot will keep sending the latest updates of the subreddit, untill stopped by the /stop command.

## Features

- 🕐Get periodic updates Example: every 5 minutes.
- 💁Customizable subreddit and interval time.
- 🔥Unique new posts everytime.
- ⏮️If no new posts available, it sends an earlier post untill there are latest updates available.

## Demo

![Bot demo](static/demo.gif)

## Steps

- npm install: Install dependencies
- Create telegram bot using [botfather](https://www.siteguarding.com/en/how-to-get-telegram-bot-api-token), and save the API Key
- Create [.env file](https://www.freecodecamp.org/news/how-to-use-node-environment-variables-with-a-dotenv-file-for-node-js-and-npm/) in the root of project and set BOT_KEY to the bot API key recieved in previous step
- npm run dev: Run the server
- Start the telegram bot with /start command

## Bot commands

- /start - start getting updates
- /stop - stop getting updates
- /help - show all commands

## Author

Mayur Saroj (https://github.com/mayursarojdev)
