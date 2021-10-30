const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');

module.exports = class GiveCheeseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'givecheese',
      aliases: ['gc'],
      usage: 'givecheese <user mention/ID> <cheese count>',
      description: 'Gives the specified amount of your own cheese to the mentioned user.',
      type: client.types.CHEESE,
      examples: ['givecheese @Neesh 1000']
    });
  }
  run(message, args) {
    const member = this.getMemberFromMention(message, args[0]) || message.guild.members.cache.get(args[0]);
    if (!member) return this.sendErrorMessage(message, 0, 'Please mention a user or provide a valid user ID');
    if (member.id === message.client.user.id)
      return message.channel.send('Thank you, you\'re too kind! But I must decline. I prefer not to take handouts.');
    const amount = parseInt(args[1]);
    const cheese = message.client.db.users.selectCheese.pluck().get(message.author.id, message.guild.id);
    if (isNaN(amount) === true || !amount)
      return this.sendErrorMessage(message, 0, 'Please provide a valid cheese count');
    if (amount < 0 || amount > cheese) return this.sendErrorMessage(message, 0, stripIndent`
      Please provide a cheese count less than or equal to ${cheese} (your total cheese)
    `);
    // Remove points
    message.client.db.users.updateCheese.run({ cheese: -amount }, message.author.id, message.guild.id);
    // Add points
    const oldCheese = message.client.db.users.selectCheese.pluck().get(member.id, message.guild.id);
    message.client.db.users.updateCheese.run({ cheese: amount }, member.id, message.guild.id);
    let description;
    if (amount === 1) description = `Successfully transferred **${amount}** 🧀 to ${member}!`;
    else description = `Successfully transferred **${amount}** 🧀 to ${member}!`;
    const embed = new MessageEmbed()
      .setTitle(`${member.displayName}'s Cheese`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(description)
      .addField('From', message.member, true)
      .addField('To', member, true)
      .addField('Cheese', `\`${oldCheese}\` ➔ \`${amount + oldCheese}\``, true)
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(member.displayHexColor);
    message.channel.send(embed);
  }
};
