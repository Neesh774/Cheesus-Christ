const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
module.exports = class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'asynceval',
      usage: 'asynceval <code>',
      description: 'Executes the provided async code and shows output.',
      type: client.types.OWNER,
      ownerOnly: true,
      examples: ['asynceval 1 + 1']
    });
  }
  async run(message, args) {
    const input = args.join(' ');
    if (!input) return this.sendErrorMessage(message, 0, 'Please provide code to eval');
    if(!input.toLowerCase().includes('token')) {

      const embed = new MessageEmbed();

      try {
        let output = await eval('(async () => {' + input + '})()');
        if (typeof output !== 'string') output = require('util').inspect(output, { depth: 0 });
        
        embed
          .addField('Input', `\`\`\`js\n${input.length > 1024 ? 'Too large to display.' : input}\`\`\``)
          .addField('Output', `\`\`\`js\n${output.length > 1024 ? 'Too large to display.' : output}\`\`\``)
          .setColor('#66FF00'); 

      } catch(err) {
        embed
          .addField('Input', `\`\`\`js\n${input.length > 1024 ? 'Too large to display.' : input}\`\`\``)
          .addField('Output', `\`\`\`js\n${err.length > 1024 ? 'Too large to display.' : err}\`\`\``)
          .setColor('#FF0000');
      }

      message.channel.send(embed);

    } else {
      message.channel.send('(╯°□°)╯︵ ┻━┻ MY token. **MINE**.');
    }
  }
};