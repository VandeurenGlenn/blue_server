import {env} from '@blueserver/env'
import {CoinMarketCap} from './api/coinmarketcap.js'
import {GitHub} from './api/github.js'
import {SEVEN_DAYS_AGO} from './constants.js'

export class DataBuilder {
	coinMarketCap: CoinMarketCap
	gitHub: GitHub

	constructor(keys: {coinmarketcap: string; github: string}) {
		if (!keys) throw new Error('no api keys found (did you setup env?)')

		this.coinMarketCap = new CoinMarketCap(keys.coinmarketcap)
		this.gitHub = new GitHub(keys.github)
	}

	/**
	 * @param top the number of projects in the top to fetch
	 * @returns {BlueAsset[]} list of blue indicators (for the front end)
	 */
	async createAssetList(limit = 100): Promise<BlueAsset[]> {
		const listings: CMCListing[] = await this.coinMarketCap.getLatestListings(limit)
		const listingsInfo = await this.coinMarketCap.getListingInfo(listings.map((l) => l.id))

		return Promise.all(
			Object.values(listingsInfo).map(async (asset, i) => {
				const blueAsset: BlueAsset = {
					id: asset.id,
					rank: listings[i].cmc_rank,
					platform: listings[i].platform,
					platforms: asset.contract_address,
					change24h: listings[i].quote.USD.percent_change_24h,
					change1h: listings[i].quote.USD.percent_change_1h,
					symbol: asset.symbol,
					name: asset.name,
					logo: asset.logo,
					website: asset.urls.website[0],
					repos: asset.urls.source_code,
					github: {
						activity: {additions: 0, deletions: 0, total: 0},
						repos: [],
						contributers: []
					},
					indicators: {
						github: null
					}
				}

				const githubRepos = blueAsset.repos.filter((repo) => repo.includes('github'))

				// A github repo was present in CMC data, we fetch informations
				if (githubRepos.length > 0) {
					const urlParts = (githubRepos[0] as string).replace('https://', '').split('/')

					let repos = await this.gitHub.getRepos(urlParts[1])

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
							} as Partial<GithubProjectResponse>
						})

						blueAsset.github.repos.sort(
							(rA, rB) => new Date(rB.pushed_at!).getTime() - new Date(rA.pushed_at!).getTime()
						)
					}
				}
				i++

				return blueAsset
			})
		)
	}
}

export const dataBuilder = new DataBuilder(env)
