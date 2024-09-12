import fetch from 'node-fetch'
import {TWENTY_FOUR_HOURS} from '../../constants.js'
import {readCacheFile, writeCacheFile} from '../../cache.js'

export const COINBASE_CACHE_FILENAME = 'coinbase-asset-list.json'

export type CoinBaseAssetList = {
	id: string
	name: string
	min_size: string
	status: 'online' | 'offline'
	message: string | null
	max_precision: string
	convertible_to: []
	details: {
		type: 'crypto'
		symbol: string | null
		network_confirmations: number
		sort_order: number
		crypto_address_link: string | null
		crypto_transaction_link: string | null
		push_payment_methods: []
		group_types: []
		display_name: string | null
		processing_time_seconds: string | null
		min_withdrawal_amount: number
		max_withdrawal_amount: number
	}
	default_network: string
	supported_networks: any[]
	display_name: string
}[]

export class Coinbase {
	lastUpdated: number = 0
	list: CoinBaseAssetList = []

	async fetchList() {
		if (this.lastUpdated === 0) {
			try {
				const {lastUpdated, data} = await readCacheFile(COINBASE_CACHE_FILENAME)
				this.list = data
				this.lastUpdated = lastUpdated
			} catch (error) {}
		}
		if (this.needsUpdate()) {
			console.time('[Coinbase] Fetching remote data')
			const response = await fetch('https://api.exchange.coinbase.com/currencies', {
				headers: {
					Accept: 'application/json'
				}
			})

			this.list = (await response.json()) as CoinBaseAssetList
			this.lastUpdated = Date.now()
			await writeCacheFile(COINBASE_CACHE_FILENAME, {lastUpdated: this.lastUpdated, data: this.list})
			console.timeEnd('[Coinbase] Fetching remote data')
		}
	}

	needsUpdate(): boolean {
		return Date.now() - this.lastUpdated >= TWENTY_FOUR_HOURS
	}

	// we only return assets that are online (tradeable)
	hasAsset(asset: string): boolean {
		return this.list.filter((a) => a.id === asset && a.status === 'online')[0] !== undefined
	}
}
