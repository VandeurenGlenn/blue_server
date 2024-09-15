import {PropertyValues, state} from 'snar'
import {Ticker} from './ticker.js'
import chalk from 'chalk'
import {cmcTicker} from './coinmarketcap.js'
import {Dex} from '../api/exchanges/dex/dex.js'
import {PubSub} from '../pubsub.js'
import {deepClone} from '../utils.js'

export type PriceAsset = {
	cmd_id: number
	price: number
	platforms: {price: number; name: string; contract_address: string}[]
}

class DexTicker extends Ticker {
	// runtime data that represents computed data from ticker call
	@state() data: PriceAsset[] | undefined = undefined

	updated(changed: PropertyValues<this>) {
		if (changed.has('data') && this.data !== undefined) {
			this.logger.log(`data available: ${this.data.length}`)
			PubSub.publish('price', this.data)
		}
	}

	#priceTask = async ({platforms, id, price}: BlueAsset) => {
		for (const platform of platforms) {
			try {
				if (platform.platform.name === 'Ethereum') {
					platform.price = await Dex.getPrice(platform.contract_address, 1)
					console.log('eth', platform.price)
				} else if (platform.platform.name === 'BNB Smart Chain (BEP20)') {
					platform.price = await Dex.getPrice(platform.contract_address, 56)
					console.log('bnb', platform.price)
				} else if (platform.platform.name === 'Base') {
					platform.price = await Dex.getPrice(platform.contract_address, 250)
				} else if (platform.platform.name === 'Polygon') {
					platform.price = await Dex.getPrice(platform.contract_address, 137)
				} else if (platform.platform.name === 'Optimism') {
					platform.price = await Dex.getPrice(platform.contract_address, 10)
				} else if (platform.platform.name === 'Arbitrum') {
					platform.price = await Dex.getPrice(platform.contract_address, 42161)
					// } else {
					// throw `platform not supported: ${platform.platform.name}`
				}
				// } else if (platform.platform.name === 'Avalanche') {
				//   platform.price = await Dex.getPrice(platform.contract_address, 43114)
				// } else if (platform.platform.name === 'Harmony') {
				// } else if (platform.platform.name === 'Fantom') {
				// } else if (platform.platform.name === 'Solana') {
				//   platform.price = await Dex.getPrice(platform.contract_address, 101)
				// else {
				// 	console.log('Platform not supported', platform.platform.name)
				// }
			} catch (error) {
				console.error(error)

				throw {error, platform}
			}
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

	#batchData = async (tasks: {task: Function; args: any[]}[]) => {
		const data: PriceAsset[] = []

		const batchJob = async (promises: any[]) => {
			for (const result of await Promise.allSettled(promises)) {
				if (result.status === 'fulfilled') {
					result.value.platforms = (result.value.platforms as BlueAsset['platforms']).filter((p) => p.price)
					if (result.value.platforms.length > 0) data.push(result.value as unknown as PriceAsset)
				}
			}
		}

		const runBatch = async () => {
			const promises = tasks.splice(0, 9).map(({task, args}) => task(...args))
			await batchJob(promises)
			if (tasks.length > 0) {
				await runBatch()
			}
		}
		await runBatch()

		return data
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
				promises.push({task: this.#priceTask, args: [asset]})
			}
		}

		this.data = await this.#batchData(promises)

		// Force another ticker to run again if needed e.g.
		// if (githubTicker.isRunning()) {
		// 	githubTicker.goToNextBatch(this)
		// }
	}
}

export const dexTicker = new DexTicker('dex', chalk.blue)
