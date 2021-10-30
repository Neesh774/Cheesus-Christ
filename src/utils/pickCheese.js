const { MessageEmbed } = require('discord.js');

module.exports = async function(message, client) {
  client.picking = true;
  const channel = message.channel;
  const collected = [];

  const embed = new MessageEmbed()
    .setDescription('Cheesus dropped some cheese on the ground! Quickly, type `.cheese` to pick it up!')
    .setTimestamp()
    .setColor(message.guild.me.displayHexColor);
  const sent = await channel.send(embed);

  const collector = channel.createMessageCollector(m => {
    return !collected.includes(m.author.id) && m.content.toLowerCase() === '.cheese';
  }, { time: 10000 });

  collector.on('collect', m => {
    collected.push(m.author.id);
    m.delete();
    const pickedEmbed = new MessageEmbed()
      .setDescription(`${m.author} picked up some cheese!`)
      .setColor(m.member.displayHexColor);
    m.channel.send(pickedEmbed).then((m) => {m.delete({ timeout: 3000 });});
    client.db.users.updateCheese.run({ cheese: 1}, m.author.id, m.guild.id);
  });

  collector.on('end', () => {
    client.picking = false;
    sent.delete().catch(() => null);
  });
};