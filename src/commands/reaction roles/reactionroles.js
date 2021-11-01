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
  async run(message, args) {
    const reactionRoles = JSON.parse(message.client.db.settings.selectReactionRoles.pluck().get(message.guild.id));
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
      const fields = await channelReactionRoles.map(async (reactionRole, i) => {
        const role = message.guild.roles.cache.get(reactionRole.role);
        const emoji = reactionRole.emoji.length === 2? reactionRole.emoji : message.guild.emojis.cache.get(reactionRole.emoji);
        const message = await channel.messages.fetch(reactionRole.message);
        return {
          name: `${i + 1} | ${role.toString()}`,
          value: `${emoji} [Jump to Message](${message.url})`
        };
      });

      if(channelReactionRoles.length === 0) {
        embed.setDescription(`None in ${channel.toString()}`);
        return message.channel.send(embed);
      }
      if(channelReactionRoles.length > 10) {
        new ReactionMenu(message.client, message.channel, message.member, embed, fields, 10);
      } else {
        embed.addFields(fields);
      }
      return message.channel.send(embed);
    }
    const fields = reactionRoles.map((reactionRole, i) => {
      const role = message.guild.roles.cache.get(reactionRole.role);
      const emoji = reactionRole.emoji.length === 2? reactionRole.emoji : message.guild.emojis.cache.get(reactionRole.emoji);
      return {
        name: `${i + 1} ${emoji}`,
        value: `${role.toString()} | [Jump!](https://discord.com/channels/${message.guild.id}/${reactionRole.channel}/${reactionRole.message})`
      };
    });
    if(reactionRoles.length > 10) {
      new ReactionMenu(message.client, message.channel, message.member, embed, fields, 10);
    } else {
      embed.addFields(fields);
      return message.channel.send(embed);
    }
  }
};
