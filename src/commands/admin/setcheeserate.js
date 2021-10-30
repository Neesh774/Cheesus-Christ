const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');

module.exports = class SetCommandPointsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setcheeserate',
      aliases: ['setcheeser', 'scrate'],
      usage: 'setcheeserate <rate>',
      description: 'Sets the rate that Cheesus will drop cheese, from 1 to 3, with 1 being the slowest and 3 being the fastest.',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setcheeserate 3']
    });
  }
  run(message, args) {
    const amount = args[0];
    if (!amount || !Number.isInteger(Number(amount)) || amount < 0) 
      return this.sendErrorMessage(message, 0, 'Please enter a positive integer');
    const cheeseRate = message.client.db.settings.selectCheeseRate.get(message.guild.id).cheese_rate;
    const status = message.client.utils.getStatus(cheeseRate);
    message.client.db.settings.updateCheeseRate.run(amount, message.guild.id);
    const embed = new MessageEmbed()
      .setTitle('Settings: `Cheese Rate`')
      
      .setDescription(`The \`cheese rate\` value was successfully updated. ${success}`)
      .addField('Cheese Rate', `\`${cheeseRate}\` ➔ \`${amount}\``, true)
      .addField('Status', `\`${status}\``)
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    message.channel.send(embed);
  }
};
