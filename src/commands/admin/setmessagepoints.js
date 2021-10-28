const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');

module.exports = class SetMessagePointsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setmessagepoints',
      aliases: ['setmsgpoints', 'setmp', 'smp'],
      usage: 'setmessagepoints <point count>',
      description: 'Sets the amount of points earned per user message.',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setmessagepoints 1']
    });
  }
  run(message, args) {
    const amount = args[0];
    if (!amount || !Number.isInteger(Number(amount)) || amount < 0) 
      return this.sendErrorMessage(message, 0, 'Please enter a positive integer.');
    const { 
      point_tracking: pointTracking, 
      message_points: messagePoints, 
      command_points: commandPoints,
      voice_points: voicePoints 
    } = message.client.db.settings.selectPoints.get(message.guild.id);
    const status = message.client.utils.getStatus(pointTracking);
    message.client.db.settings.updateMessagePoints.run(amount, message.guild.id);
    const embed = new MessageEmbed()
      .setTitle('Settings: `Points`')
      
      .setDescription(`The \`message points\` value was successfully updated. ${success}`)
      .addField('Message Points', `\`${messagePoints}\` ➔ \`${amount}\``, true)
      .addField('Command Points', `\`${commandPoints}\``, true)
      .addField('Voice Points', `\`${voicePoints}\``, true)
      .addField('Status', status)
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    message.channel.send(embed);
  }
};
