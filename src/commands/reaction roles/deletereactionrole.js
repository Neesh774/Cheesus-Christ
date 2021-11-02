const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class DeleteReactionRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'deletereactionrole',
      aliases: ['drr', 'removereactionrole', 'rrr'],
      usage: 'deletereactionrole <id>',
      description: 'Deletes a reaction role using it\'s id.',
      type: client.types.REACTIONROLES,
      userPermissions: ['MANAGE_ROLES', 'MANAGE_GUILD'],
      examples: ['deletereactionrole 4']
    });
  }
  async run(message, args) {
    let reactionRoles = JSON.parse(message.client.db.settings.selectReactionRoles.pluck().get(message.guild.id));
    const index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0) return this.sendErrorMessage(message, 0, 'You must provide an id.');
    const entries = Object.entries(reactionRoles);
    const numReactionRoles = entries.reduce((accumulator, item) => {
      return accumulator + item[1].reactions.length;
    }, 0);
    if (index > numReactionRoles) return this.sendErrorMessage(message, 0, 'That reaction role doesn\'t exist.');
    let messageChannel;
    let reactionRole;
    let i = 0;
    for (const [key, value] of entries) {
      for(let numReaction = 0; numReaction < value.reactions.length; numReaction++) {
        if(numReaction + i === index) {
          messageChannel = key;
          reactionRole = value.reactions[numReaction];
          break;
        }
      }
      i += value.reactions.length;
    }
    if(!messageChannel) {
      return this.sendErrorMessage(message, 0, 'That reaction role doesn\'t exist.');
    }
    const channel = message.guild.channels.cache.get(messageChannel.split('-')[1]);
    const msg = await channel.messages.fetch(messageChannel.split('-')[0]);
    try{
      await msg.reactions.cache.get(reactionRole.emoji).users.remove();
    } catch(e) {
      // do nothing
    }
    const emoji = reactionRole.emoji.length === 2 ? reactionRole.emoji : message.guild.emojis.cache.get(reactionRole.emoji);
    const role = message.guild.roles.cache.get(reactionRole.role);
    reactionRoles[messageChannel].reactions.splice(reactionRoles[messageChannel].reactions.indexOf(reactionRole), 1);
    if(reactionRoles[messageChannel].reactions.length === 0) {
      delete reactionRoles[messageChannel];
    }
    message.client.db.settings.updateReactionRoles.run(JSON.stringify(reactionRoles), message.guild.id);
    const embed = new MessageEmbed()
      .setTitle('Deleted Reaction Role')
      .setDescription('Successfully deleted reaction role.')
      .addField('Channel', channel.toString())
      .addField('Emoji', emoji)
      .addField('Role', role.toString())
      .setColor(message.guild.me.displayHexColor);
    return message.channel.send(embed);
  }
};
