const houses = require("./houses.json");

module.exports = async function(message) {
    const user = message.member;
    const houseIds = Object.values(houses);
    let sorted = false;
    await houseIds.forEach(async houseId => {
        if(user.roles.cache.has(houseId)) {
            sorted = true;
            await message.delete();
            return message.channel.send(`${user}, you are already sorted!`).then(msg => msg.delete({timeout: 5000}));
        }
    })
    if(sorted) return;
    const random = Math.floor(Math.random() * houseIds.length);
    const house = houseIds[random];
    user.roles.add(house);
    await message.delete();
    return message.channel.send(`${user}, you are now sorted!`).then(msg => msg.delete({timeout: 5000}));
}