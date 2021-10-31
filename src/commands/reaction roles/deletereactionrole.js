const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

module.exports = class SetAdminRoleCommand extends Command {
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
    
  }
};
