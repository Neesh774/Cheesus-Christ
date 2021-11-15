const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const ReactionMenu = require('../ReactionMenu.js');

module.exports = class SetAdminRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reactionroles',
      aliases: ['rroles'],
      usage: 'reactionroles <channel mention / ID>',
      description: 'Lists out all the available reaction roles, with an option to get all reaction roles in a specific channel.',
      type: client.types.REACTIONROLES,
      userPermissions: ['MANAGE_ROLES'],
      examples: ['reactionroles #general']
    });
  }
  run(message, args) {
    const reactionRoles = JSON.parse(message.client.db.settings.selectReactionRoles.pluck().get(message.guild.id));
    const embed = new MessageEmbed()
      .setTitle('Reaction Roles')
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    if (!reactionRoles) {
      embed.setDescription('None');
      return message.channel.send(embed);
    }
    let channel;
    if(args[0]) {
      channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
      if(!channel) return this.sendErrorMessage(message, 0, 'Enter a valid channel mention or ID');
      embed.setTitle(`Reaction Roles in ${channel.name}`);
    }
    const entries = Object.entries(reactionRoles);
    let fields = [];
    let reactionRoleIndex = 1;
    for(let i = 0;i < entries.length;i++) {
      const reactionRoleMessage = entries[i];
      if(channel) {
        if(reactionRoleMessage[0].split('-')[1] !== channel.id) continue;
      }
      const channelID = reactionRoleMessage[0].split('-')[1];
      const messageID = reactionRoleMessage[0].split('-')[0];
      let reactionRoleText = reactionRoleMessage[1].reactions.map(reactionRole => {
        const role = message.guild.roles.cache.get(reactionRole.role);
        const emoji = reactionRole.emoji.length < 10? reactionRole.emoji : message.guild.emojis.cache.get(reactionRole.emoji);
        return `**${reactionRoleIndex++}** ${emoji}${emoji.id ? `(*${emoji.id}*)` : ''} **|** ${role.toString()}(*${role.id}*)`;
      }).join('\n');
      reactionRoleText = `[**Click to Jump to Message**](https://discord.com/channels/${message.guild.id}/${channelID}/${messageID}) **| ${reactionRoleMessage[1].setting ? 'Toggle' : 'Pick'}**\n` + reactionRoleText;
      fields.push(reactionRoleText);
    }
    if(fields.length === 0) {
      embed.setDescription(`None found${channel ? ` in ${channel.toString()}`: ''}`);
      return message.channel.send(embed);
    }
    embed.setAuthor('Click on the roles to jump to the message!');
    embed.setFooter('Expires after two minutes.\n' + message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }));
    new ReactionMenu(message.client, message.channel, message.member, embed, fields, 1);
  }
};
