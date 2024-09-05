// @ts-ignore
import SocketRequestClient from 'socket-request-client'
import {type BlueAsset} from '../../DataBuilder.js'
import {WS_PORT} from '../../constants.js'

export class WSApiClient {
	#connectionPromise
	#client: any

	constructor() {
		const url = !import.meta.env.DEV ? `wss://blue.leofcoin.org` : `ws://localhost:${WS_PORT}`
		this.#connectionPromise = new SocketRequestClient(url, 'protocol-blue').init()
		this.#connectionPromise.then((client: any) => {
			this.#client = client
		})
	}

	get clientReady() {
		return this.#connectionPromise
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
