import {SocketRequestClient} from 'socket-request-client'
import {type BlueAsset} from '../../DataBuilder.js'
import {type AvailableRoute, WS_PORT} from '../../constants.js'
import ClientConnection from 'socket-request-client/connection'
import {type ChangesList} from '../../pubsub.js'

export class WSApiClient {
	#connectionPromise
	#client: ClientConnection | undefined

	constructor() {
		const url = !import.meta.env.DEV ? `wss://blue.leofcoin.org` : `ws://localhost:${WS_PORT}`
		this.#connectionPromise = new SocketRequestClient(url, 'protocol-blue').init()
		this.#connectionPromise.then((client) => {
			this.#client = client
		})
	}

	get clientReady() {
		return this.#connectionPromise
	}

	top100(): Promise<BlueAsset[]> {
		if (!this.#client) {
			throw new Error('Client is not available.')
		}
		return this.#client.request({url: 'top100'})
	}

	change24h(): Promise<ChangesList[]> {
		if (!this.#client) {
			throw new Error('Client is not available.')
		}
		return this.#client.request({url: 'change24h'})
	}

	change1h(): Promise<ChangesList[]> {
		if (!this.#client) {
			throw new Error('Client is not available.')
		}
		return this.#client.request({url: 'change1h'})
	}

	subscribe(event: AvailableRoute, cb: (data: any) => void) {
		if (!this.#client) {
			throw new Error('Client is not available.')
		}
		return this.#client.pubsub.subscribe(event, cb)
	}
}
