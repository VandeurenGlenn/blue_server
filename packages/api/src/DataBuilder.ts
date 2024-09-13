import {env} from '@blueserver/env'
import {writeFile} from 'fs/promises'
import {join} from 'node:path'
import {CoinMarketCap} from './api/Coinmarketcap.js'
import {Binance} from './api/exchanges/Binance.js'
import {Coinbase} from './api/exchanges/coinbase.js'
import {Kraken} from './api/exchanges/kraken.js'
import {GitHub} from './api/github.js'
import {createCacheDirectory} from './cache.js'
import {CACHE_ROOT_DIRECTORY, SEVEN_DAYS_AGO} from './constants.js'

export class DataBuilder {
	coinMarketCap: CoinMarketCap
	gitHub: GitHub
	kraken: Kraken
	coinbase: Coinbase

	constructor(keys: {coinmarketcap: string; github: string}) {
		if (!keys) throw new Error('no api keys found (did you setup env?)')

		this.coinMarketCap = new CoinMarketCap(keys.coinmarketcap)
		this.gitHub = new GitHub(keys.github)
		this.kraken = new Kraken()
		this.coinbase = new Coinbase()
	}

	/**
	 * @param top the number of projects in the top to fetch
	 * @returns {BlueAsset[]} list of blue indicators (for the front end)
	 */
	async createAssetList(limit = 100): Promise<BlueAsset[]> {
		await this.coinbase.fetchList()
		await this.kraken.fetchList()

		if (Binance.isExchangeInfoObsolete()) {
			await Binance.fetchExchangeInfo()
		}

		// console.log(cache.exchanges.coinbase.list['BTC'])
		const listings: CMCListing[] = await this.coinMarketCap.getLatestListings(limit)
		await createCacheDirectory()
		writeFile(join(CACHE_ROOT_DIRECTORY, 'cmclistings.json'), JSON.stringify(listings))
		const listingsInfo = await this.coinMarketCap.getListingInfo(listings.map((l) => l.id))
		const listingsInfoMap = Object.values(listingsInfo)
		writeFile(join(CACHE_ROOT_DIRECTORY, 'listingsinfo.json'), JSON.stringify(listingsInfoMap))

		return Promise.all(
			listingsInfoMap.map(async (asset) => {
				const slug = asset.slug
				const listing = listings.find((l) => l.slug === slug)
				// This is temporary to see if this solution works over time
				if (!listing) {
					throw new Error('listing not found from listingInfo object')
				}

				const blueAsset: BlueAsset = {
					id: asset.id,
					// hash: '',
					slug,
					rank: listing.cmc_rank,
					platform: listing.platform,
					platforms: asset.contract_address,
					// price: listing.quote.USD.price,
					// marketCap: listing.quote.USD.market_cap,
					// circulating_supply: listing.circulating_supply,
					changes: {
						percent_1h: listing.quote.USD.percent_change_1h,
						percent_24h: listing.quote.USD.percent_change_24h
					},
					symbol: asset.symbol,
					name: asset.name,
					logo: asset.logo,
					website: asset.urls.website[0],
					repos: asset.urls.source_code,
					exchanges: [
						//
						...(Binance.doesPairExist(asset.symbol, 'USDT') ? ['binance' as AvailableExchange] : [])
						// add more
					],
					github: {
						activity: {additions: 0, deletions: 0, total: 0},
						repos: [],
						contributers: []
					},
					indicators: {
						github: null
					}
				}

				if (this.kraken.hasAsset(asset.symbol)) {
					blueAsset.exchanges.push('kraken')
				}

				if (this.coinbase.hasAsset(asset.symbol)) {
					blueAsset.exchanges.push('coinbase')
				}

				const githubRepos = blueAsset.repos.filter((repo) => repo.includes('github'))

				// A github repo was present in CMC data, we fetch informations
				if (githubRepos.length > 0) {
					const urlParts = (githubRepos[0] as string).replace('https://', '').split('/')

					let repos = await this.gitHub.fetchRepos(urlParts[1])

					if (repos.length > 0) {
						let promises = []
						for (const repo of repos) {
							// repo had activity within 7 days, so we try to get it's stats
							if (new Date(repo.pushed_at).getTime() + SEVEN_DAYS_AGO >= new Date().getTime()) {
								const [owner, name] = repo.full_name.split('/')
								promises.push(this.gitHub.getRepositoryCodeFrequency(owner, name))
							} else {
								// there was no activity, remove the repo to keep data to front minimal
								// blueAsset.github.repos.splice(repos.indexOf(repo))
							}
						}
						promises = await Promise.all(promises)
						blueAsset.github.activity = promises.reduce(
							(previous, current) => {
								previous.additions += current.additions
								previous.deletions += current.deletions
								previous.total += current.additions + current.deletions
								return previous
							},
							{additions: 0, deletions: 0, total: 0}
						)

						blueAsset.github.repos = repos.map((repo) => {
							return {
								name: repo.name,
								full_name: repo.full_name,
								private: repo.private,
								url: repo.html_url,
								description: repo.description,
								fork: repo.fork,
								pushed_at: repo.pushed_at,
								created_at: repo.created_at,
								size: repo.size,
								watchers: repo.watchers,
								forks: repo.forks,
								visibility: repo.visibility,
								owner: {
									name: repo.owner.name,
									avatar: repo.owner.avatar,
									gravatar: repo.owner.gravatar,
									type: repo.owner.type
								}
							} as Partial<GithubRepoResponse>
						})

						blueAsset.github.repos.sort(
							(rA, rB) => new Date(rB.pushed_at!).getTime() - new Date(rA.pushed_at!).getTime()
						)
					}
				}

				// blueAsset.hash = await hashIt(encode(JSON.stringify(blueAsset)))
				return blueAsset
			})
		)
	}
}

export const dataBuilder = new DataBuilder(env)
