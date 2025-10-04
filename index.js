require('dotenv').config();

const { Client } = require('discord.js-selfbot-v13');
const messageHandler = require('./src/handlers/messageHandler');
const log = require('./src/utils/logger');

const client = new Client({
    checkUpdate: false,
});

client.on('ready', async () => {
    log.success(`Logged in as ${client.user.tag}`);
    log.info('Bot is initializing and caching servers...');

    await new Promise(resolve => setTimeout(resolve, 5000));

    log.info(`${client.guilds.cache.size} servers are cached.`);
    log.success('Bot is fully ready and now listening for commands.');

    messageHandler(client);
});

process.on('SIGINT', () => {
    log.warning('\nProcess interrupted by user. Exiting...');
    client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    log.error(`Unhandled rejection: ${error.stack || error}`);
});

process.on('uncaughtException', (error) => {
    log.error(`Uncaught exception: ${error.stack || error}`);
    process.exit(1);
});

log.header('Attempting to log in...');
client.login(process.env.TOKEN)
    .catch((error) => {
        log.error(`Login Failed: ${error.message}`);
        log.warning('Please ensure your TOKEN is correct in the .env file.');
        process.exit(1);
    });