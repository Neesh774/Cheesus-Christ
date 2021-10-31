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
    console.log(reactionRoles);
    const embed = new MessageEmbed()
      .setTitle('Reaction Roles')
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    if (reactionRoles.length === 0) {
      embed.setDescription('None');
      return message.channel.send(embed);
    }
    if(args[0]) {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
      if(!channel) return this.sendErrorMessage(message, 0, args[0]);
      const channelReactionRoles = reactionRoles.filter(reactionRole => reactionRole.channel === channel.id);
      if(channelReactionRoles.length === 0) {
        embed.setDescription(`None in ${channel.toString()}`);
        return message.channel.send(embed);
      }
      if(channelReactionRoles.length > 10) {
        new ReactionMenu(message.client, message.channel, message.member, embed, channelReactionRoles, 10);
      } else {
        channelReactionRoles.forEach(reactionRole => {
          embed.addField(reactionRole.emoji, reactionRole.roleID, true);
        });
      }
      return message.channel.send(embed);
    }
    if(reactionRoles.length > 10) {
      new ReactionMenu(message.client, message.channel, message.member, embed, reactionRoles, 10);
    } else {
      reactionRoles.forEach(reactionRole => {
        embed.addField(reactionRole.emoji, reactionRole.roleID, true);
      });
    }
  }
};
