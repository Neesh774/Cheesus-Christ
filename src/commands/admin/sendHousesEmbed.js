const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const houses = require('../../utils/houses.json');

module.exports = class SetAdminRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sendhousesembed',
      aliases: ['she'],
      usage: 'sendhousesembed',
      description: 'Sends an embed containing the members in each house.',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['sendhousesembed']
    });
  }
  async run(message) {
    await message.delete();
    let fields = {
      'Gouda': '',
      'Parmesan': '',
      'Cheddar': '',
      'Brie': '',
    };
    const embed = new MessageEmbed()
      .setTitle('Houses of Cheese')
      .setDescription('Listed here are the members and points of each sacred house of cheese.')
      .setColor('#d7b33e');

    const points = JSON.parse(message.client.db.settings.selectHousePoints.pluck().get(message.guild.id));

    for(let i = 0; i < Object.keys(fields).length; i++) {
      const [id, houseName] = Object.entries(houses)[i];
      const role = await message.guild.roles.fetch(id).catch(() => null);
      if (!role) return;
      const houseMembers = role.members.map(m => m.toString());
      let fieldValue = houseMembers.join('\n');
      fields[houseName] = fieldValue;
      if(fieldValue === '') fieldValue = 'None';
      embed.addField(`${houseName}: ${points[houseName.toLowerCase()]}`, fieldValue);
    }
    const sent = await message.channel.send(embed);
    await sent.pin();  
    
  }
};
