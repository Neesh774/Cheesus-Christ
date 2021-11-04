const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const houses = require('../../utils/houses.json');
const { success } = require('../../utils/emojis.json');
const { cheeseHousesChannelId } = require('../../../config.json');

module.exports = class SetAdminRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clearhouses',
      aliases: ['ch'],
      usage: 'clearhouses',
      description: 'Clears each house of cheese',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['clearhouses']
    });
  }
  async run(message) {
    for(let i = 0; i < Object.keys(houses).length; i++) {
      const id = Object.keys(houses)[i];
      const role = await message.guild.roles.fetch(id).catch(() => null);
      if (!role) return;
      const houseMembers = role.members;
      houseMembers.each(async member => {
        await member.roles.remove(role);
      });
    }
    const embed = new MessageEmbed()
      .setDescription(`The \`houses\` were successfully cleared. ${success}`)
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    message.channel.send(embed);

    const channel = message.guild.channels.cache.get(cheeseHousesChannelId);
    const housesMessage = (await channel.messages.fetchPinned()).first();
    const houseEmbed = housesMessage.embeds[0];
    houseEmbed.fields.forEach(field => {
      field.value = 'None';
    });
    housesMessage.edit(houseEmbed);
  }
};
