import chalk from 'chalk'
import {type PropertyValues, state} from 'snar'
import {PubSub} from '../pubsub.js'
import {coinMarketCapTicker} from './coinmarketcap.js'
import {Ticker} from './ticker.js'

class GithubTicker extends Ticker {
	@state() data: any = undefined

	updated(changed: PropertyValues<this>) {
		if (changed.has('data') && this.data !== undefined) {
			this.logger.log('data available')
			PubSub.publish('github', this.data)
		}
	}

	async tickerCall(): Promise<void> {
		this.logger.log('ticker run starting')
		await coinMarketCapTicker.tickerComplete
		this.data = (this.data ?? 0) + 1

		this.logger.log('ticker run completed')
		await this.updateComplete
	}
}
export const githubTicker = new GithubTicker('github ticker', chalk.yellow)
