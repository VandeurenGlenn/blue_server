import {PORT} from '../../constants.js'
import {resolveLocalIP} from '../../util.js'

export class HttpApiClient {
	static async #fetch(endpoint: string) {
		const localAddress = resolveLocalIP() ?? 'localhost'
		const response = await fetch(
			!import.meta.env.DEV ? `https://blue.leofcoin.org/${endpoint}` : `http://${localAddress}:${PORT}/${endpoint}`
		)
		return response.json()
	}

	static top100() {
		return this.#fetch('top100') as Promise<BlueAsset[]>
	}

	static change24h() {
		return this.#fetch('change24h') as Promise<BlueAsset[]>
	}
}
