import {protocol} from '@blueserver/api/constants'
import socketRequestServer from 'socket-request-server'
import type {SocketRequestConnection} from 'socket-request-server/connection'
import {change1h, change24h, top100} from '../shared.js'

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

	#api: {[name: string]: (response: SocketResponse, params: any) => void} = {
		top100: (response) => response.send<Top100ResponseLoad>(top100()),
		change24h: (response) => response.send<ChangesList[]>(change24h()),
		change1h: (response) => response.send<ChangesList[]>(change1h())
	}
}
