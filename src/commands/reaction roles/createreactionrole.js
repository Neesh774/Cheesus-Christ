const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class SetAdminRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'createreactionrole',
      aliases: ['crr', 'reactionrole'],
      usage: 'createreactionrole <channel mention / ID> <message ID> <role mention / ID> <emoji / emojiID>',
      description: 'Creates a reaction role on a certain message in a channel.',
      type: client.types.REACTIONROLES,
      userPermissions: ['MANAGE_ROLES'],
      examples: ['createreactionrole 896797173616873533 904386630104805447 @Prophets 🧀']
    });
  }
  async run(message, args) {
    let reactionRoles = JSON.parse(message.client.db.settings.selectReactionRoles.pluck().get(message.guild.id));
    const [channelID, messageID, roleID, emoji] = args;
    if (!messageID) return this.sendErrorMessage(message, 0, 'Please provide a message ID.');
    if (!channelID) return this.sendErrorMessage(message, 0, 'Please provide a channel mention or ID.');
    if (!roleID) return this.sendErrorMessage(message, 0, 'Please provide a role mention or ID.');
    if (!emoji) return this.sendErrorMessage(message, 0, 'Please provide an emoji.');

    const channel = channelID.startsWith('<')? this.getChannelFromMention(message, channelID): message.guild.channels.cache.get(channelID);
    if (!channel) return this.sendErrorMessage(message, 0, 'Please provide a valid channel mention or ID.');
    const role = roleID.startsWith('<')? this.getRoleFromMention(message, roleID) : message.guild.roles.cache.get(roleID);
    if (!role) return this.sendErrorMessage(message, 0, 'Please provide a valid role mention or ID.');

    const msg = await channel.messages.fetch(messageID);
    if (!msg) return this.sendErrorMessage(message, 0, 'Please provide a valid message ID.');

    const emojiID = emoji.startsWith('<') ? emoji.match(/\d+/g).join('') : emoji;
    const emojiObj = emojiID.length === 2? emojiID : await message.guild.emojis.cache.get(emojiID);
    if (!emojiObj) return this.sendErrorMessage(message, 0, 'Please provide a valid emoji.');
    const emojiToString = emojiObj.length === 2? emojiObj : emojiObj.toString();

    const embed = new MessageEmbed()
      .setTitle('Reaction Role')
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);

    if(reactionRoles) {
      const reactionRole = reactionRoles.find(rr => rr.message === msg.id && rr.role === role.id);
      if(reactionRole) {
        embed.setDescription('There\'s another reaction role on this message with the same role.');
        embed.addField('Jump to Message', `[Click](${msg.url})`);
        return message.channel.send(embed);
      }
    } else {
      reactionRoles = [];
    }

    const reactionID = msg.react(emojiObj);
    const reactionRole = {
      message: msg.id,
      channel: channel.id,
      role: role.id,
      emoji: emojiID,
      reaction: reactionID
    };
    reactionRoles.push(reactionRole);
    message.client.db.settings.updateReactionRoles.run(JSON.stringify(reactionRoles), message.guild.id);
    embed.addFields(
      [
        {
          name: 'Message',
          value: `[Click](${msg.url})`
        },
        {
          name: 'Channel',
          value: `${channel.toString()}`
        },
        {
          name: 'Role',
          value: `${role.toString()}`
        },
        {
          name: 'Emoji',
          value: emojiToString
        }
      ]
    );
    return message.channel.send(embed);
  }
};
