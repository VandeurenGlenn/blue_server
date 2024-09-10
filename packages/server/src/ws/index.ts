import {cache} from '@blueserver/api/cache'
import {protocol} from '@blueserver/api/constants'
import socketRequestServer from 'socket-request-server'
import type {SocketRequestConnection} from 'socket-request-server/connection'

export type SocketResponse = {
	send: <T>(data: T, status?: number) => void
	error: (message: string) => void
}

export class WSApiServer {
	#server: {close: Function; connections: SocketRequestConnection[]} | undefined
	#connectionPromise

	constructor(options: {port: number}) {
		this.#connectionPromise = socketRequestServer({port: options.port, protocol, keepValue: true}, this.#api)
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

	#api: {[name: string]: (response: SocketResponse, params: any) => void} = {
		top100: (response) => response.send<Top100ResponseLoad>(cache.bluelist),
		change24h: (response) => response.send<ChangesList[]>(this.#change24h),
		change1h: (response) => response.send<ChangesList[]>(this.#change1h)
	}
}
