import {PropertyValues, state} from 'snar'
import {Ticker} from './ticker.js'
import chalk from 'chalk'

class ModelTicker extends Ticker {
	// runtime data that represents computed data from ticker call
	@state() data: any | undefined = undefined

	async tickerCall() {
		// Wait other tickers to complete here if needed e.g.
		// await githubTicker.tickerComplete

		this.setStart() // used to determine ticker's real run, use it after the waits

		// Write ticker logic here, such as building data.

		// This is important to ensure data is available
		// after this.tickerComplete
		await this.updateComplete

		// Force another ticker to run again if needed e.g.
		// if (githubTicker.isRunning()) {
		// 	githubTicker.goToNextBatch(this)
		// }
	}

	updated(changed: PropertyValues) {
		if (changed.has('data') && this.data !== undefined) {
			// Do something when the data is available e.g.
			// PubSub.publish('route', this.data)
		}
	}
}

export const modelTicker = new ModelTicker('model', chalk.blue)
