import fetch from 'node-fetch'
import {readCacheFile, writeCacheFile} from '../../cache.js'
import {TWENTY_FOUR_HOURS} from '../../constants.js'
import log from '../../log.js'

export const KRAKEN_CACHE_FILENAME = 'kraken-asset-list.json'

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

export class KrakenApi {
	lastUpdated: number = 0
	list: KrakenAssetList = {}
	updating: boolean = false
	updatePromise: Promise<void> | null = null

	async fetchList() {
		if ((await this.needsUpdate()) && !this.updating) {
			this.updating = true
			this.updatePromise = new Promise<void>(async (resolve, reject) => {
				// Store the promise of the ongoing update
				try {
					log.time('[Kraken] Fetching remote data')
					const response = await fetch('https://api.kraken.com/0/public/Assets', {
						headers: {
							Accept: 'application/json'
						}
					})

					this.list = ((await response.json()) as KrakenAssetListResponse).result
					this.lastUpdated = Date.now()
					await writeCacheFile(KRAKEN_CACHE_FILENAME, {lastUpdated: this.lastUpdated, data: this.list})
					log.timeEnd('[Kraken] Fetching remote data')
					resolve()
				} catch (error) {
					reject(error)
				} finally {
					this.updating = false
					this.updatePromise = null
				}
			})
		}
		return this.updatePromise
	}

	async needsUpdate(): Promise<boolean> {
		if (this.lastUpdated === 0) {
			try {
				const {lastUpdated, data} = await readCacheFile(KRAKEN_CACHE_FILENAME)
				this.list = data
				this.lastUpdated = lastUpdated
			} catch (error) {}
		}
		return Date.now() - this.lastUpdated >= TWENTY_FOUR_HOURS
	}

	// we only return assets that are online (tradeable)
	hasAsset(symbol: string): boolean {
		return this.list[symbol]?.status === 'enabled'
	}
}

export const Kraken = new KrakenApi()
