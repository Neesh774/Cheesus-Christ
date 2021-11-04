const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { stripIndent } = require('common-tags');

module.exports = class CheeseIgnoreChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cheeseignorechannel',
      aliases: ['cic', 'cheeseignore'],
      usage: 'cheeseignorechannel <channel mention/ID>',
      description: 'Whether Cheesus will ignore a channel when dropping cheese.',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['cheeseignorechannel #general']
    });
  }
  run(message, args) {
    const { trimArray  } = message.client.utils;
    let cheeseIgnoreChannels = message.client.db.settings.selectCheeseIgnoreChannels.pluck().get(message.guild.id);
    if(!cheeseIgnoreChannels) cheeseIgnoreChannels = '';
    let oldCheeseIgnoreChannels = [];
    if (cheeseIgnoreChannels) {
      for (const channel of cheeseIgnoreChannels.split(' ')) {
        oldCheeseIgnoreChannels.push(message.guild.channels.cache.get(channel));
      }
      oldCheeseIgnoreChannels = trimArray(oldCheeseIgnoreChannels).join(' ');
    }
    if (oldCheeseIgnoreChannels.length === 0) oldCheeseIgnoreChannels = '`None`';
    const embed = new MessageEmbed()
      .setTitle('Settings: `Cheese`')
      
      .setDescription(`The \`cheese ignore channels\` were successfully updated. ${success}`)
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);

    // Clear if no args provided
    if (args.length === 0) {
      message.client.db.settings.updateCheeseIgnoreChannels.run(null, message.guild.id);
      return message.channel.send(embed.addField('Cheese Ignore Channels', `${oldCheeseIgnoreChannels} ➔ \`None\``));
    }

    let channels = [];
    for (const arg of args) {
      const channel = this.getChannelFromMention(message, arg) || message.guild.channels.cache.get(arg);
      if (channel && channel.type === 'text' && channel.viewable) channels.push(channel);
      else return this.sendErrorMessage(message, 0, stripIndent`
        Please mention only accessible text channels or provide only valid text channel IDs
      `);
    }
    channels = [...new Set(channels)];
    const channelIds = channels.map(c => c.id).join(' '); // Only keep unique IDs
    message.client.db.settings.updateCheeseIgnoreChannels.run(channelIds, message.guild.id);
    message.channel.send(embed.addField('Cheese Ignore Channels', `${oldCheeseIgnoreChannels} ➔ ${trimArray(channels).join(' ')}`));
  }
};
