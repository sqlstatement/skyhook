import { Embed } from '../model/Embed'
import { EmbedAuthor } from '../model/EmbedAuthor'
import { BaseProvider } from '../provider/BaseProvider'
import gravatar from 'gravatar'

/**
 * https://devcenter.heroku.com/articles/app-webhooks
 */
class Heroku extends BaseProvider {

    public getName(): string {
        return 'Heroku'
    }

    public async parseData(): Promise<void> {
        this.setEmbedColor(0xC9C3E6)
        const embed = new Embed()
        const action: string = this.actionAsPastTense(this.body.action)
        const type: string = this.typeAsReadable(this.body.webhook_metadata.event.include)
        const authorName: string = this.body.actor.email
        const name = this.body.data.name
        embed.title = `${authorName} ${action} ${type}. App: ${name}`
        embed.url = this.body.data.web_url
        const author = new EmbedAuthor()
        author.name = authorName
        const imageUrl = gravatar.url(this.body.actor.email, { s: '100', r: 'x', d: 'retro' }, true)
        author.icon_url = imageUrl
        embed.author = author
        this.addEmbed(embed)
    }

    private actionAsPastTense(action: string): string {
        switch (action) {
            case 'create':
                return 'created'
            case 'destroy':
                return 'destroyed'
            case 'update':
                return 'updated'
        }
        return 'unknown'
    }

    private typeAsReadable(type: string): string {
        return type.split('api:')[1]
    }
}

export { Heroku }
