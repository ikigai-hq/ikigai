<p align="center">
  <a href="https://github.com/ikigai-hq/ikigai" target="_blank">
    <img src="https://raw.githubusercontent.com/ikigai-hq/ikigai/master/assets/logo/logo.png" alt="ikigai" width="200px">
  </a>
</p>

<p align="center">
    <a href="https://ikigai.li">Ikigai</a> •
    <a href="https://docs.ikigai.li">Documentation</a> • 
    <a href="https://discord.gg/XuYWkn6kUS">Community</a>
</p>

&nbsp;

<a href="https://github.com/ikigai-hq/ikigai"><img src="https://raw.githubusercontent.com/ikigai-hq/ikigai/master/assets/app-screenshot.jpeg" alt="Best Assignment Open Source" /></a>

> Our project is currently in development, which means our code will be evolving frequently. We appreciate your patience during this process. 
> If you ever need assistance or have any questions, please don't hesitate to reach out to us within our [community](https://discord.gg/XuYWkn6kUS). We're here to help!

# Ikigai

ikigai is an Open Assignment Platform for educators that provides seamless access via a single link, embeddable in your website or LMS, featuring rich quiz types and a flexible layout adaptable to your exam format.

# Install

## Use Source Code

### Step 1: Download Source Code

```bash
git clone https://github.com/ikigai-hq/ikigai.git
```

Jump into source code

```bash
cd ikigai
```

### Step 2: Install docker and docker compose

- Docker: https://docs.docker.com/engine/install/
- Docker Compose: https://docs.docker.com/compose/install/

### Step 3: Install node, yarn, and pm2

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm install 18
nvm use 18
npm install yarn -g
npm install pm2 -g
```

### Step 3: Run Server

Run Graphql Server
```bash
cd graphql_server
docker-compose up -d
cd ..
```

Run Client Side (Make sure you're in root path)

```bash
yarn install
cd apps/ikigai
yarn build
pm2 start "yarn start" --name ikigai-client
```

# 🚀 Sponsors

🌟 Become a Sponsor! 🌟

🚀 Help us keep `Ikigai` thriving! By sponsoring, you directly support ongoing development, ensuring more features, better maintenance, and a stronger community.

[Sponsor us](https://ko-fi.com/ikigaihq)

# Join Our Supportive Community! (Need help)

Looking for knowledgeable assistance from our core team and contributors? Our community offers:

- A welcoming and supportive environment
- Expertise from knowledgeable members
- Support from our core team and contributors

Join us now: [ikigai community](https://discord.gg/XuYWkn6kUS).
