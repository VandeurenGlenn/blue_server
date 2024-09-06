import socketRequestServer from 'socket-request-server'
import {cache} from '@blueserver/api/cache'
import {PubSub, type ChangesList} from '@blueserver/api/pubsub'

export type SocketResponse = {
	send: (data: any, status?: number) => void
	error: (message: any) => void
}

export class WSApiServer {
	#server: {close: Function; connections: WebSocket[]} | undefined
	#connectionPromise

	constructor(options: {port: number}) {
		this.#connectionPromise = socketRequestServer({port: options.port, protocol: 'protocol-blue'}, this.#api)
		this.#connectionPromise.then((server) => {
			this.#server = server
			PubSub.subscribe('top100', () => {
				if (this.#server?.connections)
					for (const connection of this.#server?.connections) {
						connection.publish('top100', cache.bluelist)
					}
			})

			PubSub.subscribe('change24h', () => {
				if (this.#server?.connections)
					for (const connection of this.#server?.connections) {
						connection.publish('change24h', this.#change24h)
					}
			})
		})
	}

	get serverReady() {
		return this.#connectionPromise
	}

	get #change24h() {
		return cache.bluelist.map<ChangesList>((a) => ({id: a.id, change24h: a.change24h}))
	}

	#api: {[index: string]: (params: any, response: SocketResponse) => void} = {
		top100: (response) => response.send(cache.bluelist),
		change24h: (response) => response.send(this.#change24h)
	}
}
