import {PORT} from '../../constants.js'
import {type BlueAsset} from '../../DataBuilder.js'

declare global {
	interface ImportMeta {
		env: {
			DEV: boolean
		}
	}
}

export class HttpApiClient {
	static async #fetch(endpoint: string) {
		const response = await fetch(
			!import.meta.env.DEV ? `https://blue.leofcoin.org/${endpoint}` : `http://localhost:${PORT}/${endpoint}`
		)
		return response.json()
	}

	static top100() {
		return this.#fetch('top-100') as Promise<BlueAsset[]>
	}
}
