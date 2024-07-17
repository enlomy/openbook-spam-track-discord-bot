# OpenBook Spam Track Discord Bot

## Description

This project is a TypeScript backend platform designed to enhance user interactions with Raydium and OpenBook markets. Providing mechanisms to catch and handle spammers making transactions to the OpenBook market. Detected spam transactions trigger notifications sent via Discord webhooks.

## Features

1. **Spam Detection**
   - Monitor transactions to the OpenBook market.
   - Identify and catch spammers.

2. **Discord Notifications**
   - Send notifications to a Discord channel using webhooks when spammers are detected.

## Technologies Used

- **TypeScript**: For writing scalable and maintainable code.
- **Solana Web3**: For interacting Solana Blockchain.
- **Discord Webhooks**: For sending notifications about spam transactions.

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dappsol/openbook-spam-track-discord-bot.git
   cd openbook-spam-track-discord-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root directory.
   - Add the necessary configuration for your setup.

4. Run the project:
   ```bash
   npm start
   ```

## Usage

- Monitor the Discord channel for notifications about spam transactions.
