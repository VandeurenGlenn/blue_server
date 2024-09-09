import {cache} from '@blueserver/api/cache'
import socketRequestServer from 'socket-request-server'
import type {SocketRequestConnection} from 'socket-request-server/connection'

export type SocketResponse = {
	send: (data: any, status?: number) => void
	error: (message: any) => void
}

export class WSApiServer {
	#server: {close: Function; connections: SocketRequestConnection[]} | undefined
	#connectionPromise

	constructor(options: {port: number}) {
		this.#connectionPromise = socketRequestServer({port: options.port, protocol: 'protocol-blue'}, this.#api)
		this.#connectionPromise.then((server) => {
			this.#server = server
		})
	}

	get serverReady() {
		return this.#connectionPromise
	}

	get #change24h() {
		return cache.bluelist.map<ChangesList>((a) => ({id: a.id, change: a.change24h}))
	}

	get #change1h() {
		return cache.bluelist.map<ChangesList>((a) => ({id: a.id, change: a.change1h}))
	}

	#api: {[index: string]: (params: any, response: SocketResponse) => void} = {
		top100: (response) => response.send(cache.bluelist),
		change24h: (response) => response.send(this.#change24h),
		change1h: (response) => response.send(this.#change1h)
	}
}
