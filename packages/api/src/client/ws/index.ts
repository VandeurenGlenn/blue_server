// @ts-ignore
import SocketRequestClient from 'socket-request-client'
import {type BlueAsset} from '../../DataBuilder.js'
import {WS_PORT} from '../../constants.js'

const url = !import.meta.env.DEV ? `wss://blue.leofcoin.org` : `ws://localhost:${WS_PORT}`

export class WSApiClient {
	#client = new SocketRequestClient(url, 'protocol-blue')

	constructor() {
		this.#init()
	}

	async #init() {
		this.#client = await this.#client.init()
	}

	top100(): Promise<BlueAsset[]> {
		return this.#client.request({url: 'top100'})
	}

	change24h(): Promise<{[id: string]: string}> {
		return this.#client.request({url: 'change24h'})
	}

	subscribe(event: string, cb: Function) {
		return this.#client.pubsub.subscribe(event, cb)
	}
}
