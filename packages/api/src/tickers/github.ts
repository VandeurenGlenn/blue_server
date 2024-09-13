import chalk from 'chalk'
import {type PropertyValues, state} from 'snar'
import {PubSub} from '../pubsub.js'
import {coinMarketCapTicker} from './coinmarketcap.js'
import {Ticker} from './ticker.js'

class GithubTicker extends Ticker {
	@state() projects: GithubProject[] | undefined = undefined

	updated(changed: PropertyValues<this>) {
		if (changed.has('projects') && this.projects !== undefined) {
			this.logger.log('data available')
			PubSub.publish('github', this.projects)
		}
	}

	async tickerCall(): Promise<void> {
		// Make sure CMC ticker is not running
		await coinMarketCapTicker.tickerComplete
		this.logger.log('ticker run starting')

		this.logger.log('ticker run completed')
		await this.updateComplete
	}
}
export const githubTicker = new GithubTicker('github ticker', chalk.yellow)
