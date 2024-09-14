import {SocketRequestClient} from 'socket-request-client'
import {type AvailableRoute, protocol, WS_PORT} from '../../constants.js'
import ClientConnection from 'socket-request-client/connection'
import {resolveLocalIP} from '../../utils.js'

export class WSApiClient {
	#connectionPromise
	#client: ClientConnection | undefined

	constructor() {
		const localAddress = resolveLocalIP() ?? 'localhost'
		const url = !import.meta.env.DEV ? `wss://ws-blue.leofcoin.org` : `ws://${localAddress}:${WS_PORT}`
		this.#connectionPromise = new SocketRequestClient(url, protocol).init()
		this.#connectionPromise.then((client) => {
			this.#client = client
		})
	}

	get clientReady() {
		return this.#connectionPromise
	}

	top100(): Promise<Top100ResponseLoad> {
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
