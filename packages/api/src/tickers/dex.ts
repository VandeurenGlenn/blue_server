import {PropertyValues, state} from 'snar'
import {Ticker} from './ticker.js'
import chalk from 'chalk'
import {cmcTicker} from './coinmarketcap.js'
import {Dex} from '../api/exchanges/dex/dex.js'
import {PubSub} from '../pubsub.js'
import {deepClone} from '../utils.js'

class DexTicker extends Ticker {
	// runtime data that represents computed data from ticker call
	@state() data: any | undefined = undefined

	updated(changed: PropertyValues<this>) {
		if (changed.has('data') && this.data !== undefined) {
			this.logger.log('data available/updated')
			PubSub.publish('price', this.data)
		}
	}

	#priceTask = async ({platforms, id, price}: BlueAsset) => {
		for (const platform of platforms) {
			try {
				if (platform.platform.name === 'Ethereum') {
					platform.price = await Dex.getPrice(platform.contract_address, 1)
				} else if (platform.platform.name === 'Binance Smart Chain (BEP20)') {
					platform.price = await Dex.getPrice(platform.contract_address, 56)
				}
			} catch (error) {}
		}
		return {
			cmc_id: id,
			price, //cmc price
			platforms: platforms.map((p) => ({
				price: p.price,
				name: p.platform.name,
				contract_address: p.contract_address
			}))
		}
	}

	async tickerCall() {
		// Wait other tickers to complete here if needed e.g.
		await cmcTicker.runComplete

		this.setStart() // used to determine ticker's real run, use it after the waits

		// Write ticker logic here, such as building data.
		const promises = []

		const data = deepClone(cmcTicker.blueAssets)
		if (!data) {
			this.logger.log('No data available cmcTicker failed?')
			return
		}

		for (const asset of data) {
			if (asset.platforms) {
				promises.push(this.#priceTask(asset))
			}
		}

		this.data = (await Promise.allSettled(promises)).map((asset) => {
			if (asset.status === 'fulfilled') {
				return asset.value
			}
			return null
		})

		// Force another ticker to run again if needed e.g.
		// if (githubTicker.isRunning()) {
		// 	githubTicker.goToNextBatch(this)
		// }
	}
}

export const dexTicker = new DexTicker('dex', chalk.blue)
