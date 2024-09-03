// @ts-ignore
import SocketRequestClient from 'socket-request-client'
import {type BlueAsset} from '../../DataBuilder.js'

export class WSApiClient {
	// @ts-ignore
	#client

	constructor() {
		this.#init()
	}

	async #init() {
		// @ts-ignore
		this.#client = new SocketRequestClient('ws://blue.leofcoin.org', 'protocol-blue')
		this.#client.init()
	}

	top100(): Promise<BlueAsset[]> {
		return this.#client.request({url: 'top100'})
	}

	twentyFourHourPriceChange(): Promise<{[id: string]: string}> {
		return this.#client.request({url: 'twentyFourHourPriceChange'})
	}

	subscribe(event: string, cb: Function) {
		return this.#client.pubsub.subscribe(event, cb)
	}
}
