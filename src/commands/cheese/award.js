const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');
const { success } = require('../../utils/emojis.json');
const { cheeseHousesChannelId } = require('../../../config.json');

module.exports = class CheeseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'award',
      aliases: ['bestow'],
      usage: 'award <points> <house>',
      description: oneLine`
        Gives a certain house a number of points. The houses are \`Brie\`, \`Parmesan\`, \`Cheddar\`, and \`Gouda\`.
      `,
      type: client.types.CHEESE,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
      examples: ['award 25 Brie']
    });
  }
  async run(message, args) {
    const amount = parseInt(args.shift());
    const house = args.join(' ').toLowerCase();
    if(!amount) return this.sendErrorMessage(message, 0,  'You need to specify the amount of points you want to give.');
    if(!house) return this.sendErrorMessage(message, 0, 'You need to specify the house you want to give the points to.');

    let points = JSON.parse(message.client.db.settings.selectHousePoints.pluck().get(message.guild.id));
    if(!points) points = {
      'brie': 0,
      'gouda': 0,
      'parmesan': 0,
      'cheddar': 0
    };
    if(isNaN(points[house])){
      console.log(points);
      console.log(points[house]);
      return this.sendErrorMessage(message, 0, 'That house does not exist.');
    }
    points[house] += amount;
    message.client.db.settings.updateHousePoints.run(JSON.stringify(points), message.guild.id);
    const embed = new MessageEmbed()
      .setTitle(`${success} ${message.member.displayName} gave ${amount} points to ${house.charAt(0).toUpperCase() + house.slice(1)}!`)
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.author.displayHexColor);
    message.channel.send(embed);

    const channel = message.guild.channels.cache.get(cheeseHousesChannelId);
    const housesMessage = (await channel.messages.fetchPinned()).first();
    const housesEmbed = housesMessage.embeds[0];
    housesEmbed.fields.forEach(field => {
      if(field.name.toLowerCase().startsWith(house)){
        field.name = house.charAt(0).toUpperCase() + house.slice(1) + ': ' + points[house];
      }
    });
    housesMessage.edit(housesEmbed);
  }
};