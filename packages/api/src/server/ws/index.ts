import socketRequestServer from 'socket-request-server'
import {cache} from './../../cache.js'

export type SocketResponse = {
	send: (data: any, status?: number) => void
	error: (message: any) => void
}

export class WSApiServer {
	#server: {close: Function; connections: any[]} | undefined

	constructor(options: {port: number}) {
		this.#init(options.port)
	}
	async #init(port: number) {
		this.#server = await socketRequestServer({port, protocol: 'protocol-blue'}, this.#api)

		cache.subscribe('top100', () => {
			if (this.#server?.connections)
				for (const connection of this.#server?.connections) {
					connection.send('top100', cache.bluelist)
				}
		})

		cache.subscribe('change24h', () => {
			if (this.#server?.connections)
				for (const connection of this.#server?.connections) {
					connection.send(
						'change24h',
						cache.bluelist.map((a) => ({id: a.id, change: a.change24h}))
					)
				}
		})
	}

	#api: {[index: string]: (params: any, response: SocketResponse) => void} = {
		top100: (response) => response.send(cache.bluelist),
		twentyFourHourPriceChange: (response) => response.send(cache.bluelist.map((a) => ({id: a.id, change: a.change24h})))
	}
}
