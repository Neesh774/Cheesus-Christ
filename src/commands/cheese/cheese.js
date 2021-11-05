const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

module.exports = class CheeseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cheese',
      aliases: ['mycheese'],
      usage: 'cheese <user mention/ID>',
      description: oneLine`
        Shows the amount of cheese the user has.
      `,
      type: client.types.CHEESE,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
      examples: ['cheese @Neesh']
    });
  }
  run(message, args) {
    const member =  this.getMemberFromMention(message, args[0]) || 
        message.guild.members.cache.get(args[0]) || 
        message.member;
    const cheese = message.client.db.users.selectCheese.pluck().get(member.id, message.guild.id);
    const embed = new MessageEmbed()
      .setTitle(`${member.displayName}'s Cheese`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addField('Member', message.member, true)
      .addField('Cheese', `\`${cheese}\``, true)
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(member.displayHexColor);
    message.channel.send(embed);
  }
};
