const ServerCloner = require('../Cloner');
const log = require('../utils/logger');

const pendingOperations = new Map();

function messageHandler(client) {
    client.on('messageCreate', async (message) => {
        if (message.author.bot && message.author.id !== client.user.id) return;

        const allowedUserIds = process.env.ALLOWED_USER_IDS?.split(',').map(id => id.trim()) || [];
        if (!allowedUserIds.includes(message.author.id)) return;
        
        if (pendingOperations.has(client.user.id)) {
            if (message.author.id === client.user.id) {
                await handlePendingOperation(message, client);
            }
            return; 
        }

        if (message.content.startsWith('!clone')) {
            await handleCloneCommand(message, client);
        }
    });
}

async function handleCloneCommand(message, client) {
    const args = message.content.slice(6).trim().split(/ +/);
    const [sourceGuildId, targetGuildId] = args;

    if (!sourceGuildId || !targetGuildId) {
        return message.channel.send('❌ Usage: `!clone <source server ID> <target server ID>`');
    }
    
    const sourceGuild = client.guilds.cache.get(sourceGuildId);
    const targetGuild = client.guilds.cache.get(targetGuildId);

    if (!sourceGuild) return message.channel.send('❌ Source server not found!');
    if (!targetGuild) return message.channel.send('❌ Target server not found!');

    pendingOperations.set(client.user.id, {
        step: 'confirmProceed',
        sourceGuildId,
        targetGuildId,
        channelId: message.channel.id
    });

    message.channel.send(`📋 **Server Cloning Confirmation**
- Source: **${sourceGuild.name}**
- Target: **${targetGuild.name}**

Do you want to proceed? (type \`y\` or \`n\`)`);
}

async function handlePendingOperation(message, client) {
    const operation = pendingOperations.get(client.user.id);
    if (!operation || message.channel.id !== operation.channelId) return;

    const response = message.content.toLowerCase().trim();
    if (!['y', 'yes', 'n', 'no'].includes(response)) return;

    const progressChannel = await client.channels.fetch(operation.channelId).catch(() => null);
    if (!progressChannel) {
        log.error("Failed to fetch progress channel, cancelling operation.");
        pendingOperations.delete(client.user.id);
        return;
    }

    if (operation.step === 'confirmProceed') {
        if (response.startsWith('y')) {
            operation.step = 'confirmEmojis';
            pendingOperations.set(client.user.id, operation);
            progressChannel.send('❓ Do you want to clone emojis as well? (type `y` or `n`)');
        } else {
            pendingOperations.delete(client.user.id);
            progressChannel.send('❌ Operation cancelled.');
        }
    } else if (operation.step === 'confirmEmojis') {
        const cloneEmojis = response.startsWith('y');
        pendingOperations.delete(client.user.id);
        
        progressChannel.send(`🚀 Starting server cloning process...${cloneEmojis ? ' (including emojis)' : ''}`);
        
        try {
            const cloner = new ServerCloner(client);
            cloner.cloneServer(operation.sourceGuildId, operation.targetGuildId, cloneEmojis, progressChannel);
        } catch (error) {
            log.error(`Cloning error: ${error.message}\n${error.stack}`);
            progressChannel.send(`❌ An error occurred while cloning: ${error.message}`);
        }
    }
}

module.exports = messageHandler;