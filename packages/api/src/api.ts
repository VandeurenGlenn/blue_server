import {cmcTicker} from './tickers/coinmarketcap.js'
import {githubTicker} from './tickers/github.js'

export class API {
	static top100(): Top100ResponseLoad {
		// TODO: where to find lastUpdated now?
		return {list: cmcTicker.blueAssets ?? [], lastUpdated: 0}
	}

	static github(): GithubProject[] | undefined {
		return githubTicker.projects
	}

	// TODO: can merge these functions in one with a period parameter
	static change24h(): ChangesList[] | undefined {
		return cmcTicker.blueAssets?.map<ChangesList>((a) => ({id: a.id, change: a.changes.percent_24h}))
	}
	static change1h(): ChangesList[] | undefined {
		return cmcTicker.blueAssets?.map<ChangesList>((a) => ({id: a.id, change: a.changes.percent_1h}))
	}
}
