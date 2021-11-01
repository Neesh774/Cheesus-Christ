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
      userPermissions: ['MANAGE_ROLES'],
      examples: ['deletereactionrole 4']
    });
  }
  async run(message, args) {
    let reactionRoles = JSON.parse(message.client.db.settings.selectReactionRoles.pluck().get(message.guild.id));
    const index = parseInt(args[0]) - 1;
    if (isNaN(index)) return this.sendErrorMessage(message, 0, 'You must provide an id.');
    if (!reactionRoles[index]) return this.sendErrorMessage(message, 0, 'That reaction role doesn\'t exist.');
    const reactionRole = reactionRoles[index];
    const channel = message.guild.channels.cache.get(reactionRole.channel);
    const msg = await channel.messages.fetch(reactionRole.message);
    await msg.reactions.cache.get(reactionRole.emoji).users.remove();
    const emoji = reactionRole.emoji.length === 2 ? reactionRole.emoji : message.guild.emojis.cache.get(reactionRole.emoji);
    const role = message.guild.roles.cache.get(reactionRole.role);
    reactionRoles.splice(index, 1);
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
