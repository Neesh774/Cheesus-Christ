const { MessageEmbed } = require('discord.js');
const sortUser = require('../utils/sortUser');
const { sortingChannelId } = require('../../config.json');
const pickCheese = require('../utils/pickCheese');

module.exports = (client, message) => {
  if (message.channel.type === 'dm' || !message.channel.viewable || message.author.bot) return;

  const valid = new RegExp(/[sS]ort me 🧀/g);
  if (valid.test(message.content) && message.channel.id === sortingChannelId){
    return sortUser(message);
  }
  // Get disabled commands
  let disabledCommands = client.db.settings.selectDisabledCommands.pluck().get(message.guild.id) || [];
  if (typeof(disabledCommands) === 'string') disabledCommands = disabledCommands.split(' ');
  
  // Get points
  const { point_tracking: pointTracking, message_points: messagePoints, command_points: commandPoints } = 
    client.db.settings.selectPoints.get(message.guild.id);

  // Command handler
  const prefix = client.db.settings.selectPrefix.pluck().get(message.guild.id);
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*`);

  if (prefixRegex.test(message.content)) {

    // Get mod channels
    let modChannelIds = message.client.db.settings.selectModChannelIds.pluck().get(message.guild.id) || [];
    if (typeof(modChannelIds) === 'string') modChannelIds = modChannelIds.split(' ');

    const [, match] = message.content.match(prefixRegex);
    const args = message.content.slice(match.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    let command = client.commands.get(cmd) || client.aliases.get(cmd); // If command not found, check aliases
    if (command && !disabledCommands.includes(command.name)) {

      // Check if mod channel
      if (modChannelIds.includes(message.channel.id)) {
        if (
          command.type != client.types.MOD || (command.type == client.types.MOD && 
          message.channel.permissionsFor(message.author).missing(command.userPermissions) != 0)
        ) {
          // Update points with messagePoints value
          if (pointTracking)
            client.db.users.updatePoints.run({ points: messagePoints }, message.author.id, message.guild.id);
          return; // Return early so Cheesus Christ doesn't respond
        }
      }

      // Check permissions
      const permission = command.checkPermissions(message);
      if (permission) {

        // Update points with commandPoints value
        if (pointTracking)
          client.db.users.updatePoints.run({ points: commandPoints }, message.author.id, message.guild.id);
        message.command = true; // Add flag for messageUpdate event
        return command.run(message, args); // Run command
      }
    } else if ( 
      (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) &&
      message.channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS']) &&
      !modChannelIds.includes(message.channel.id)
    ) {
      const embed = new MessageEmbed()
        .setTitle('Hi, I\'m Cheesus Christ. Need help?')
        .setDescription(`You can see everything I can do by using the \`${prefix}help\` command.`)
        .setFooter('DM Neesh#7740 to speak directly with the developer!')
        .setColor(message.guild.me.displayHexColor);
      message.channel.send(embed);
    }
  }

  // Update points with messagePoints value
  if (pointTracking) client.db.users.updatePoints.run({ points: messagePoints }, message.author.id, message.guild.id);

  const cheeseRate = parseInt(client.db.settings.selectCheeseRate.get(message.guild.id).cheese_rate) / 25;
  const sendPick = Math.random() < cheeseRate && !client.picking;
  if(sendPick) pickCheese(message, client);
};

