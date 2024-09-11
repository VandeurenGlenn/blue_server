import fetch from 'node-fetch'

export class Kraken {
	async getAssetList(): Promise<KrakenAssetList['result']> {
		const response = await fetch('https://api.kraken.com/0/public/Assets', {
			headers: {
				Accept: 'application/json'
			}
		})
		return ((await response.json()) as KrakenAssetList).result
	}
}
