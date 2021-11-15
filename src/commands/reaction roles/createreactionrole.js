const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

module.exports = class SetAdminRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'createreactionrole',
      aliases: ['crr', 'reactionrole'],
      usage: 'createreactionrole <channel mention / ID> <message ID> <role mention / ID> <emoji / emojiID> <toggle/pick>',
      description: oneLine`
        Creates a reaction role on a certain message in a channel. 
        The 5th parameter is whether or not you want the reaction role to toggle or pick.
      `,
      type: client.types.REACTIONROLES,
      userPermissions: ['MANAGE_ROLES'],
      examples: ['createreactionrole 896797173616873533 904386630104805447 @Prophets 🧀 true']
    });
  }
  async run(message, args) {
    let reactionRoles = JSON.parse(message.client.db.settings.selectReactionRoles.pluck().get(message.guild.id));
    if(!reactionRoles) reactionRoles = {};
    const [channelID, messageID, roleID, emoji, setting] = args;
    if (!messageID) return this.sendErrorMessage(message, 0, 'Please provide a message ID.');
    if (!channelID) return this.sendErrorMessage(message, 0, 'Please provide a channel mention or ID.');
    if (!roleID) return this.sendErrorMessage(message, 0, 'Please provide a role mention or ID.');
    if (!emoji) return this.sendErrorMessage(message, 0, 'Please provide an emoji.');
    if (!setting) return this.sendErrorMessage(message, 0, 'Please provide a setting([toggle] or [pick]).');

    const channel = channelID.startsWith('<')? this.getChannelFromMention(message, channelID): message.guild.channels.cache.get(channelID);
    if (!channel) return this.sendErrorMessage(message, 0, 'Please provide a valid channel mention or ID.');
    const role = roleID.startsWith('<')? this.getRoleFromMention(message, roleID) : message.guild.roles.cache.get(roleID);
    if (!role) return this.sendErrorMessage(message, 0, 'Please provide a valid role mention or ID.');

    const msg = await channel.messages.fetch(messageID);
    if (!msg) return this.sendErrorMessage(message, 0, 'Please provide a valid message ID.');

    const emojiID = emoji.startsWith('<') ? emoji.match(/\d+/g).join('') : emoji;
    const emojiObj = emojiID.length < 15? emojiID : await message.guild.emojis.cache.get(emojiID);
    if (!emojiObj) return this.sendErrorMessage(message, 0, 'Please provide a valid emoji.');
    const emojiToString = emojiObj.length < 15? emojiObj : emojiObj.toString();

    const toggle = setting.toLowerCase() === 'toggle';
    const embed = new MessageEmbed()
      .setTitle('Reaction Role')
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);

    const reactionRoleID = `${messageID}-${channelID}`;
    if(Object.keys(reactionRoles).includes(reactionRoleID)) {
      const reaction = {
        emoji: emojiID,
        role: roleID
      };
      reactionRoles[reactionRoleID].reactions.push(reaction);
      reactionRoles[reactionRoleID].setting = toggle;
    } else {
      reactionRoles[reactionRoleID] = {
        setting: toggle,
        reactions: [{
          emoji: emojiID,
          role: roleID
        }]
      };
    }
    msg.react(emojiObj);
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
