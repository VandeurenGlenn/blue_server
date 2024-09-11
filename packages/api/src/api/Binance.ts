import fetch from 'node-fetch'

interface BinanceExchangeInfoResponse {
	symbols: [{baseAsset: string; quoteAsset: string}]
}

class BinanceAPI {
	#availablePairs: Pair[] | undefined = undefined
	#fetchPromise: Promise<Pair[]> | undefined = undefined

	constructor() {
		this.fetchAvailablePairs()
	}

	/**
	 * Fetch and save Binance available pairs in a prop.
	 * This function is called on construct.
	 * Call this every time you want to update the data
	 */
	async fetchAvailablePairs() {
		return (this.#fetchPromise = new Promise(async (resolve, reject) => {
			try {
				const response = await fetch(`https://www.binance.com/api/v3/exchangeInfo`)
				const data = (await response.json()) as BinanceExchangeInfoResponse
				this.#availablePairs = data.symbols.map((s) => {
					return {base: s.baseAsset, quote: s.quoteAsset}
				})
				// We clone to avoid callers to modify the data.
				resolve(JSON.parse(JSON.stringify(this.#availablePairs)))
			} catch (err) {
				reject(err)
			}
		}))
	}

	get fetchComplete() {
		return this.#fetchPromise
	}

	/**
	 * e.g. quote USDT will return all pairs USDT tradable pairs such as BTC/USDT, ETH/USDT, etc...
	 */
	getAllPairsOfQuote(quote: string) {
		if (this.#availablePairs === undefined) {
			throw new Error(
				'Available pairs data not available. Make sure to wait for the fetch to terminate using `fetchComplete` promise.'
			)
		}
		return this.#availablePairs.filter((pair) => pair.quote === quote)
	}
}

export const Binance = new BinanceAPI()
