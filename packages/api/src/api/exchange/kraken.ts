import fetch from 'node-fetch'
import {readCacheFile, writeCacheFile} from '../../cache.js'
import {KRAKEN_CACHE_FILENAME, TWENTY_FOUR_HOURS} from '../../constants.js'

export type KrakenAssetList = {
	[key: string]: {
		altname: string
		aclass: string
		decimals: number
		display_decimals: number
		collateral_value?: number
		status: 'enabled' | 'disabled'
	}
}

export type KrakenAssetListResponse = {
	error: []
	result: KrakenAssetList
}

export class Kraken {
	lastUpdated: number = 0
	list: KrakenAssetList = {}

	async fetchList() {
		if (this.lastUpdated === 0) {
			try {
				const {lastUpdated, list} = await readCacheFile(KRAKEN_CACHE_FILENAME)
				this.list = list
				this.lastUpdated = lastUpdated
			} catch (error) {}
		}
		if (this.needsUpdate()) {
			console.time('[Kraken] Fetching remote data')
			const response = await fetch('https://api.kraken.com/0/public/Assets', {
				headers: {
					Accept: 'application/json'
				}
			})

			this.list = ((await response.json()) as KrakenAssetListResponse).result
			this.lastUpdated = Date.now()
			await writeCacheFile(KRAKEN_CACHE_FILENAME, {lastUpdated: this.lastUpdated, list: this.list})
			console.timeEnd('[Kraken] Fetching remote data')
		}
	}

	needsUpdate(): boolean {
		return Date.now() - this.lastUpdated >= TWENTY_FOUR_HOURS
	}

	// we only return assets that are online (tradeable)
	hasAsset(symbol: string): boolean {
		return this.list[symbol]?.status === 'enabled'
	}
}
