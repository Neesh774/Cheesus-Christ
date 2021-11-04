const houses = require('./houses.json');
const { cheeseHousesChannelId } = require('../../config.json');

module.exports = async function(message) {
  await message.delete();
  const user = message.member;
  const houseIds = Object.keys(houses);
  let sorted = false;
  await houseIds.forEach(houseId => {
    if(user.roles.cache.has(houseId)) {
      sorted = true;
      return message.channel.send(`${user}, you are already sorted!`).then(msg => msg.delete({timeout: 5000}));
    }
  });
  if(sorted) return;
  const random = Math.floor(Math.random() * houseIds.length);
  const house = houseIds[random];
  user.roles.add(house);

  const channel = message.guild.channels.cache.get(cheeseHousesChannelId);
  const housesMessage = (await channel.messages.fetchPinned()).first();
  const embed = housesMessage.embeds[0];
  embed.fields.forEach(field => {
    if(field.name === houses[house]) {
      if(field.value === 'None') {
        field.value = `${user.toString()}`;
      } else {
        field.value = field.value + `\n${user.toString()}`;
      }
    }
  });
  housesMessage.edit(embed);
  return message.channel.send(`${user}, you are now sorted!`).then(msg => msg.delete({timeout: 5000}));
};