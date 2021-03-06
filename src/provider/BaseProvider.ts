import camel from 'camelcase'
import winston from 'winston'
import { DiscordPayload } from '../model/DiscordPayload'
import { Embed } from '../model/Embed'
import { LoggerUtil } from '../util/LoggerUtil'

/**
 * Base provider, which all other providers will subclass. You can then
 * use the provided methods to format the data to Discord
 */
abstract class BaseProvider {

    /**
     * Formats the type passed to make it work as a method reference. This means removing underscores
     * and camel casing.
     * @param type the event type
     */
    public static formatType(type: string): string {
        if (type == null) {
            return null
        }
        type = type.replace(/:/g, '_') // needed because of BitBucket
        return camel(type)
    }

    protected payload: DiscordPayload
    protected logger: winston.Logger
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected headers: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected body: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected query: any
    // all embeds will use this color
    protected embedColor: number

    constructor() {
        this.payload = new DiscordPayload()
        this.logger = LoggerUtil.logger()
    }

    /**
     * Override this and provide the name of the provider
     */
    public getName(): string {
        return null
    }

    /**
     * By default, the path is always just the same as the name, all lower case. Override if that is not the case
     */
    public getPath(): string {
        return this.getName().toLowerCase()
    }

    /**
     * Parse the request and respond with a DiscordPayload
     * @param body the request body
     * @param headers the request headers
     * @param query the query
     */ 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    public async parse(body: any, headers: any = null, query: any = null): Promise<DiscordPayload> {
        this.body = body
        this.headers = headers
        this.query = query
        this.preParse()
        let type = 'parseData'
        if (typeof this['getType'] !== 'undefined') {
            type = await this['getType']()
        }
        type = BaseProvider.formatType(type)

        if (typeof this[type] !== 'undefined') {
            this.logger.info(`Calling ${type}() in ${this.constructor.name} provider.`)
            await this[type]()
        }
        this.postParse()

        return this.payload
    }

    /**
     * Open method to do certain things pre parse
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected preParse(): void {}

    /**
     * Open method to do certain things post parse and before the payload is returned
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected postParse(): void {}

    protected addEmbed(embed: Embed): void {
        // TODO check to see if too many fields
        if (this.embedColor != null) {
            embed.color = this.embedColor
        }
        if (this.payload.embeds == null) {
            this.payload.embeds = []
        }
        this.payload.embeds.push(embed)
    }

    protected setEmbedColor(color: number): void {
        this.embedColor = color
    }
}

export { BaseProvider }
