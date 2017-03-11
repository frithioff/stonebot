import { oneLine } from 'common-tags'
import { Message, RichEmbed, TextChannel } from 'discord.js'
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando'
import * as winston from 'winston'

import Card from '../../card/card'

export default class FlavorCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            aliases: ['f', 'flavor-text'],
            args: [{
                key: 'cardName',
                prompt: 'what card are you searching for?\n',
                type: 'string'
            }],
            description: 'Displays card text and flavor text.',
            examples: [
                'flavor devolve',
                'f small time recruits'
            ],
            group: 'card',
            memberName: 'flavor',
            name: 'flavor'
        })
    }

    public async run(msg: CommandMessage, args: { cardName: string }): Promise<Message | Message[]> {
        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) {
            return
        }

        if (!msg.channel.typing) { msg.channel.startTyping() }
        const card: Card = await Card.findByName(args.cardName)
        if (msg.channel.typing) { msg.channel.stopTyping() }

        if (!card) { return msg.reply(`sorry, I couldn't find a card with a name like '${args.cardName}'`) }

        if (msg.channel instanceof TextChannel &&
            !msg.channel.permissionsFor(this.client.user).hasPermission('EMBED_LINKS')) {
            return msg.say(oneLine`
                **${card.name}**\n
                ${card.description}\n
                **Text**\n
                ${card.text}\n
                **Flavor**\n
                ${card.flavor}\n
                ${card.url}
            `)
        }

        return msg.embed(
            new RichEmbed()
                .setTitle(card.name)
                .setDescription(card.description)
                .setURL(card.url)
                .setColor(card.classColor)
                .addField('Text', card.text)
                .addField('Flavor', card.flavor)
        )
    }
}