import {PORT} from '../../constants.js'
import {type BlueAsset} from '../../DataBuilder.js'

export class HttpApiClient {
	async #fetch(endpoint: string) {
		const response = await fetch(
			// @ts-ignore
			!import.meta.env?.DEV ? `https://blue.leofcoin.org/${endpoint}` : `http://localhost:${PORT}/${endpoint}`
		)
		return response.json()
	}

	top100() {
		return this.#fetch('top-100') as Promise<BlueAsset[]>
	}
}
