import {env} from '@blueserver/env'
import {CMCListing} from '@blueserver/types'
import {CoinMarketCap} from './api/coinmarketcap.js'
import {GitHub, type GithubProject, type GithubProjectResponse} from './api/github.js'
import {SEVEN_DAYS_AGO} from './constants.js'

export type BlueAsset = {
	id: number
	name: string
	website: string | null
	// sourceCode: string;
	github: GithubProject
	indicators: {
		github: null
	}
}

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

		// This part is responsible of filling in the blanks (mainly github informations for now)
		return Promise.all(
			Object.values(listingsInfo).map(async (asset) => {
				const blueAsset: BlueAsset = {
					id: asset.id,
					name: asset.name,
					website: asset.urls.website[0],
					// This error is just a demonstration that we don't have
					// other solution to force consistent types.
					// sourceCode: asset.urls.source_code[0],
					github: {
						activity: {additions: 0, deletions: 0, total: 0},
						repos: asset.urls.source_code,
						contributers: []
					},
					indicators: {
						github: null
					}
				}

				const githubRepos = (blueAsset.github.repos as string[]).filter((source: string) => source.includes('github'))

				// A github repo was present in CMC data, we fetch informations
				if (githubRepos.length > 0) {
					// Remove all github links since they will be converted to object
					blueAsset.github.repos = blueAsset.github.repos.filter((repo) => !(repo as string).includes('github'))

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

						// Keep the main project if it exists or the first one.
						const mainProject = repos.find(
							(repo) => repo instanceof Object && repo.name?.toLowerCase() === asset.name.toLowerCase()
						)
						if (mainProject) {
							blueAsset.github.repos.push(mainProject)
						} else {
							// TODO: Needs a better selection algorithm here rather than choosing first one,
							//            maybe choosing the last updated?
							// TODO: Also needs a prop extract function for better reading
							blueAsset.github.repos.push({
								name: repos[0].name,
								full_name: repos[0].full_name,
								private: repos[0].private,
								url: repos[0].html_url,
								description: repos[0].description,
								fork: repos[0].fork,
								pushed_at: repos[0].pushed_at,
								created_at: repos[0].created_at,
								size: repos[0].size,
								watchers: repos[0].watchers,
								forks: repos[0].forks,
								visibility: repos[0].visibility,
								owner: {
									name: repos[0].owner.name,
									avatar: repos[0].owner.avatar,
									gravatar: repos[0].owner.gravatar,
									type: repos[0].owner.type
								}
							} as Partial<GithubProjectResponse>)
						}
					}
				}
				return blueAsset
			})
		)
	}
}

export const dataBuilder = new DataBuilder(env)
