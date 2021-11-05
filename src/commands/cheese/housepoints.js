const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

module.exports = class CheeseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'housepoints',
      aliases: ['hp'],
      usage: 'housepoints',
      description: oneLine`
        Lists the points that each House of Cheese has.
      `,
      type: client.types.CHEESE,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
      examples: ['housepoints']
    });
  }
  run(message) {
    let points = JSON.parse(message.client.db.settings.selectHousePoints.pluck().get(message.guild.id));
    if(!points) {
      points = {
        'brie': 0,
        'gouda': 0,
        'parmesan': 0,
        'cheddar': 0
      };
      message.client.db.settings.updateHousePoints.run(JSON.stringify(points), message.guild.id);
    }
    const embed = new MessageEmbed()
      .setTitle('Points of the Houses of Cheese')
      .addField('Brie', points.brie, true)
      .addField('Gouda', points.gouda, true)
      .addField('Parmesan', points.parmesan, true)
      .addField('Cheddar', points.cheddar, true)
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    message.channel.send(embed);
  }
};