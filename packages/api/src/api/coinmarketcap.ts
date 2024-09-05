import fetch from 'node-fetch'

export class CoinMarketCap {
	#headers = new Headers()

	constructor(key: string) {
		this.#headers.append('X-CMC_PRO_API_KEY', key)
	}

	/** [{ "id": "1", ... }] */
	async getLatestListings(top = 100) {
		const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=${top}`, {
			headers: this.#headers
		})
		return ((await response.json()) as {data: CMCListing[]}).data
	}

	/** { "1": { ... }} */
	async getListingInfo(listingIds: string[] | string) {
		if (!Array.isArray(listingIds)) listingIds = [listingIds]
		const response = await fetch(
			`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${listingIds.join(',')}`,
			{
				headers: this.#headers
			}
		)
		return (
			(await response.json()) as {
				data: {
					[listingId: number]: CMCAsset
				}
			}
		).data
	}
}

export type CMCPlatform = {
	id: number
	name: string
	symbol: string
	slug: string
	token_address: string
}

/**
 * Type of objects returned by CMC listings endpoint.
 */
export type CMCListing = {
	id: string
	name: string
	symbol: string
	slug: string
	num_market_pairs: number
	date_added: string
	tags: string[]
	max_supply: number
	circulating_supply: number
	total_supply: number
	platform?: CMCPlatform
	infinite_supply: boolean
	cmc_rank: number
	self_reported_circulating_supply: number | null
	self_reported_market_cap: number | null
	tvl_ratio: number | null
	last_updated: string
	quote: {
		[symbol: string]: {
			price: number
			volume_24h: number
			volume_change_24h: number
			percent_change_1h: number
			percent_change_24h: number
			percent_change_7d: number
			market_cap: number
			market_cap_dominance: number
			fully_diluted_market_cap: number
			last_updated: string
		}
	}
}

/**
 * Type of objects returned by CMC Currency information endpoint.
 */
export type CMCAsset = {
	id: number
	name: string
	symbol: string
	category: string
	description: string
	slug: string
	logo?: string
	subreddit: string
	notice: string
	tags: string[] | null
	urls: {
		source_code: string[]
		website: string[]
		twitter: string[]
		chat: []
		facebook: []
		explorer: []
		announcement: []
		message_board: []
		reddit: []
		technical_doc: string[]
	}
	date_added: string
	twitter_username: string | null
	is_hidden: 0 | 1
	date_launched: string
	// type to define
	contract_address: any[]
	self_reported_circulating_supply: number | null
	self_reported_tags: string[]
	self_reported_market_cap: number | null
	infinite_supply: boolean
	// price: number;
	// sourceCode: string;
	// github: GithubProject;
}
