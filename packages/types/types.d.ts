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
	// type to define
	platform: any[]
	infinite_supply: boolean
	cmc_rank: number
	self_reported_circulating_supply: number | null
	self_reported_market_cap: number | null
	tvl_ratio: number | null
	last_updated: string
	// type to define
	quote: any[]
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
	logo: string
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

export type GithubActivity = {
	additions: number
	deletions: number
	total: number
}

// TODO
export type GithubIndicator = {}
