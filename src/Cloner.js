const { downloadImage, delay } = require('./utils/functions');
const log = require('./utils/logger');

class ServerCloner {
    constructor(client) {
        this.client = client;
        this.roleMapping = new Map();
        this.stats = {
            rolesCreated: 0,
            categoriesCreated: 0,
            channelsCreated: 0,
            emojisCreated: 0,
            failed: 0
        };
    }

    sendProgress(message, progressChannel) {
        if (progressChannel) {
            progressChannel.send(message).catch(() => {
                log.warning(`Failed to send progress message to channel: ${progressChannel.name}`);
            });
        }
        
        if (message.includes('❌') || message.includes('[-]')) {
            log.error(message.replace(/[:a-zA-Z_0-9\s]*$/, '').trim());
        } else if (message.includes('✅') || message.includes('[+]')) {
            log.success(message.replace(/[:a-zA-Z_0-9\s]*$/, '').trim());
        } else if (message.includes('📊') || message.includes('📈') || message.includes('[i]')) {
            log.info(message.replace(/[:a-zA-Z_0-9\s]*$/, '').trim());
        } else {
            console.log(message);
        }
    }

    /**
     * Executes the entire server cloning process.
     */
    async cloneServer(sourceGuildId, targetGuildId, cloneEmojis = true, progressChannel = null) {
        try {
            const sourceGuild = this.client.guilds.cache.get(sourceGuildId);
            const targetGuild = this.client.guilds.cache.get(targetGuildId);

            if (!sourceGuild) throw new Error('Source server not found! Make sure you are a member.');
            if (!targetGuild) throw new Error('Target server not found! Make sure you have admin permissions.');

            this.sendProgress(`Cloning from: ${sourceGuild.name} -> ${targetGuild.name}`, progressChannel);
            
            await this.deleteExistingContent(targetGuild, progressChannel);
            await this.cloneRoles(sourceGuild, targetGuild, progressChannel);
            await this.cloneCategories(sourceGuild, targetGuild, progressChannel);
            await this.cloneChannels(sourceGuild, targetGuild, progressChannel);
            
            if (cloneEmojis) {
                await this.cloneEmojis(sourceGuild, targetGuild, progressChannel);
            }
            
            await this.cloneServerInfo(sourceGuild, targetGuild, progressChannel);

            this.showStats(progressChannel);
            this.sendProgress('🎉 Server cloning completed successfully!', progressChannel);

        } catch (error) {
            this.sendProgress(`❌ Cloning failed: ${error.message}`, progressChannel);
            log.error(error.stack);
        }
    }
    
    async deleteExistingContent(guild, progressChannel) {
        this.sendProgress('🗑️  Deleting existing content...', progressChannel);
        for (const [, channel] of guild.channels.cache) {
            try {
                if(channel.deletable) {
                    await channel.delete();
                    await delay(100);
                }
            } catch (error) {
                this.stats.failed++;
            }
        }

        for (const [, role] of guild.roles.cache) {
            try {
                if (role.name !== '@everyone' && !role.managed && role.editable) {
                    await role.delete();
                    await delay(100);
                }
            } catch (error) {
                this.stats.failed++;
            }
        }
        this.sendProgress('Cleanup completed.', progressChannel);
    }

    async cloneRoles(sourceGuild, targetGuild, progressChannel) {
        this.sendProgress('👑 Cloning roles...', progressChannel);
        const roles = [...sourceGuild.roles.cache.values()]
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position);

        for (const role of roles) {
            try {
                const newRole = await targetGuild.roles.create({
                    name: role.name,
                    color: role.hexColor,
                    permissions: role.permissions,
                    hoist: role.hoist,
                    mentionable: role.mentionable,
                });
                this.roleMapping.set(role.id, newRole.id);
                this.stats.rolesCreated++;
                await delay(200);
            } catch (error) {
                this.sendProgress(`Failed to create role ${role.name}: ${error.message}`, progressChannel);
                this.stats.failed++;
            }
        }
    }
    
    async cloneCategories(sourceGuild, targetGuild, progressChannel) {
        this.sendProgress('📁 Cloning categories...', progressChannel);
        const categories = [...sourceGuild.channels.cache.values()]
            .filter(ch => ch.type === 'GUILD_CATEGORY')
            .sort((a, b) => a.position - b.position);

        for (const category of categories) {
            try {
                const overwrites = this.mapPermissionOverwrites(category.permissionOverwrites, targetGuild);
                await targetGuild.channels.create(category.name, {
                    type: 'GUILD_CATEGORY',
                    permissionOverwrites: overwrites,
                    position: category.position,
                });
                this.stats.categoriesCreated++;
                await delay(200);
            } catch (error) {
                this.sendProgress(`Failed to create category ${category.name}: ${error.message}`, progressChannel);
                this.stats.failed++;
            }
        }
    }

    async cloneChannels(sourceGuild, targetGuild, progressChannel) {
        this.sendProgress('💬 Cloning channels...', progressChannel);
        const channels = [...sourceGuild.channels.cache.values()]
            .filter(ch => ch.type === 'GUILD_TEXT' || ch.type === 'GUILD_VOICE')
            .sort((a, b) => a.position - b.position);

        for (const channel of channels) {
            try {
                const parent = channel.parent ? targetGuild.channels.cache.find(c => c.name === channel.parent.name && c.type === 'GUILD_CATEGORY') : null;
                const channelOptions = {
                    type: channel.type,
                    parent: parent?.id,
                    permissionOverwrites: this.mapPermissionOverwrites(channel.permissionOverwrites, targetGuild),
                    topic: channel.topic || '',
                    nsfw: channel.nsfw,
                    rateLimitPerUser: channel.rateLimitPerUser,
                    bitrate: channel.bitrate,
                    userLimit: channel.userLimit,
                };
                await targetGuild.channels.create(channel.name, channelOptions);
                this.stats.channelsCreated++;
                await delay(200);
            } catch (error) {
                this.sendProgress(`Failed to create channel ${channel.name}: ${error.message}`, progressChannel);
                this.stats.failed++;
            }
        }
    }

    async cloneEmojis(sourceGuild, targetGuild, progressChannel) {
        this.sendProgress('😀 Cloning emojis...', progressChannel);
        for (const [, emoji] of sourceGuild.emojis.cache) {
            try {
                const imageData = await downloadImage(emoji.url);
                await targetGuild.emojis.create(imageData, emoji.name);
                this.stats.emojisCreated++;
                await delay(2000);
            } catch (error) {
                this.sendProgress(`Failed to create emoji ${emoji.name}: ${error.message}`, progressChannel);
                this.stats.failed++;
            }
        }
    }

    async cloneServerInfo(sourceGuild, targetGuild, progressChannel) {
        this.sendProgress('🏠 Cloning server info...', progressChannel);
        try {
            await targetGuild.setName(sourceGuild.name);
            if (sourceGuild.iconURL()) {
                const iconData = await downloadImage(sourceGuild.iconURL({ format: 'png', size: 1024 }));
                await targetGuild.setIcon(iconData);
            }
        } catch (error) {
            this.sendProgress(`Failed to update server info: ${error.message}`, progressChannel);
            this.stats.failed++;
        }
    }

    mapPermissionOverwrites(overwrites, targetGuild) {
        return [...overwrites.cache.values()].map(overwrite => {
            const targetId = overwrite.type === 'role' ? this.roleMapping.get(overwrite.id) : overwrite.id;
            if (!targetId) return null;
            return {
                id: targetId,
                allow: overwrite.allow.toArray(),
                deny: overwrite.deny.toArray(),
            };
        }).filter(Boolean);
    }
    
    showStats(progressChannel) {
        const total = this.stats.rolesCreated + this.stats.categoriesCreated + this.stats.channelsCreated + this.stats.emojisCreated;
        const successRate = total > 0 ? Math.round((total / (total + this.stats.failed)) * 100) : 0;
        
        const statsMessage = `
📊 **Cloning Statistics:**
✅ Roles: ${this.stats.rolesCreated}
✅ Categories: ${this.stats.categoriesCreated}
✅ Channels: ${this.stats.channelsCreated}
✅ Emojis: ${this.stats.emojisCreated}
❌ Failed: ${this.stats.failed}
📈 Success Rate: ${successRate}%`;
        
        this.sendProgress(statsMessage, progressChannel);
    }
}

module.exports = ServerCloner;
