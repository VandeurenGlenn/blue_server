import {PropertyValues, state} from 'snar'
import {Ticker} from './ticker.js'
import chalk from 'chalk'

class ModelTicker extends Ticker {
	@state() data: any | undefined = undefined

	async tickerCall() {
		// Wait other tickers to complete here if needed e.g.
		// await githubTicker.tickerComplete

		this.logger.log('ticker run starting')
		// Write ticker logic here
		this.logger.log('ticker run completed')

		await this.updateComplete
		// Force another ticker to run again if needed e.g.
		// if (githubTicker.isRunning()) {
		// 	githubTicker.goToNextBatch(this)
		// }
	}

	updated(changed: PropertyValues<this>) {
		if (changed.has('data') && this.data !== undefined) {
			// Do something when the data is available e.g.
			// PubSub.publish('route', this.data)
		}
	}
}

export const modelTicker = new ModelTicker('model', chalk.blue)
