<h1 align="center">Gagster Framework Api</h1>

<div align="center">

[![Website](https://img.shields.io/badge/Website-green)](https://gagster.io)
[![Twitter](https://img.shields.io/badge/X-Community-white)](https://x.com/GagsterAgent)
[![Telegram](https://img.shields.io/badge/Telegram-Community-blue)](https://t.me/gagsterai)
[![Documentation](https://img.shields.io/badge/Documentation-Official-green)](https://api.gagster.io/api-docs)
[![Architecture](https://img.shields.io/badge/Architecture-purple)](./ARCHITECTURE.md)
[![License](https://img.shields.io/badge/license-GNU--3.0-blue)](./LICENSE)
[![Contributions](https://img.shields.io/badge/Contributions-yellow)](./CONTRIBUTE.md)
[![Requests](https://img.shields.io/badge/Community-Requests-red)](./REQUESTS)

</div>

<div align="center"><img src="https://gagster.io/gagster-logo.svg"></div>

# agentic-smart-meme
A new era for memes, we are creating a new state of art where a meme becomes smart and is not just for fun but can create fun by itself.
Welcome to the era of Smart Memes.

# The Project
Powered by ACC, this project is an open source initiative part of the Agentic Creative Complex framework to empower memes, by automating smart meme agents to generate art and share it to whole communities on X and Telegram (for now). The agentic smart meme can think by itself, talk, learn and remember its users, and use generative AI to create its own art and leverage integrations to share it to the world.

Memes are the purest expression of our collective absurdity, a beacon of chaos in a world that takes itself too seriously. A meme does not belong to anyone, memes can not be property of one but a legacy to be enjoyed and shared.

Go forth. Create, remix, share, evolve and spread chaos and joy in equal measure. Memes will outlive us all. Memes are the digital graffiti of our age. Memes are life.

# setup
*.env*
Rename the `env.test` file to `.env.local` and set the respective values.

*X Setup*
```
TWITTER_PRODUCTION=0 #allows posting to twitter
TWITTER_ALLOWED=1 #allows receiving and processing messages from twitter
REPLY_ALLOWED=1 #allows twitter replying feature
PROFILE_X_ID=
MENTION_CHECK_INTERVAL_MINUTES=6
MAX_REPLIES=5
TWITTER_BEARER_TOKEN=
TWITTER_API_KEY=
TWITTER_API_SECRET_KEY=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
CLIENT_ID=
CLIENT_SECRET=
```

*Telegram Setup*
```
TG_PRODUCTION=0 #allows posting to telegram
TG_ALLOWED=1 #allows receiving and processing messages from telegram
TG_BOT_TOKEN=
TG_BOT_USERNAME=
TG_CHAT_ID=
```

*OpenAI Setup*
```
OPENAI_API_KEY=
ART_ASSISTANT_ALLOWED=1
ART_ASSISTANT_ID=
SOCIAL_ASSISTANT_ID=
```

# Run 

*with NPM*
Requires a postgres instance
```
git clone https://github.com/Agentic-Creative-Complex/agentic-smart-meme.git
npm i
npm start
```
Access http://localhost:3000/api-docs

*with docker*
```
git clone https://github.com/Agentic-Creative-Complex/agentic-smart-meme.git
docker-compose up
```


 
