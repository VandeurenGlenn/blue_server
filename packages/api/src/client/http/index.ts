import {PORT} from '../../constants.js'
import {resolveLocalIP} from '../../utils.js'

export class HttpApiClient {
	static #localAddress = resolveLocalIP() ?? 'localhost'

	static async #fetch(endpoint: string) {
		const response = await fetch(
			!import.meta.env.DEV
				? `https://blue.leofcoin.org/${endpoint}`
				: `http://${this.#localAddress}:${PORT}/${endpoint}`
		)
		return response.json()
	}

	static top100() {
		return this.#fetch('top100') as Promise<Top100ResponseLoad>
	}

	static change24h() {
		return this.#fetch('change24h') as Promise<BlueAsset[]>
	}
}
