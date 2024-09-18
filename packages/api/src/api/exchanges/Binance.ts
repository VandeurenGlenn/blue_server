import chalk from 'chalk'
import fetch, {type Response} from 'node-fetch'
import {readCacheFile, writeCacheFile, type CacheFileData} from '../../cache.js'
import {TWENTY_FOUR_HOURS} from '../../constants.js'
import {Logger} from '../../log.js'

interface BinanceExchangeInfoResponse {
	symbols: [{baseAsset: string; quoteAsset: string}]
}

const EXCHANGE_INFO_FILENAME = 'binance-exchange-info.json'

const logger = new Logger('api (binance)', chalk.blue)

class BinanceAPI {
	#exchangeInfo: CacheFileData<BinanceExchangeInfoResponse> | undefined
	#fetchPromise: Promise<Response> | undefined = undefined

	constructor() {
		this.#loadExchangeInfo().catch(() => {
			// Doesn't exist we fetch remotely
			this.fetchExchangeInfo()
		})
	}

	async #loadExchangeInfo() {
		try {
			this.#exchangeInfo = await readCacheFile(EXCHANGE_INFO_FILENAME)
		} catch (e) {
			logger.log("Couldn't load exchange info.")
			throw e
		}
	}

	async fetchExchangeInfo() {
		logger.log('Fetching remote data.')
		const past = Date.now()
		this.#fetchPromise = fetch(`https://api.binance.com/api/v3/exchangeInfo`)
		const response = await this.#fetchPromise
		const now = Date.now()
		logger.log(`Fetched in ${(now - past) / 1000}s`)
		this.#exchangeInfo = {
			lastUpdated: now,
			data: (await response.json()) as BinanceExchangeInfoResponse
		}
		writeCacheFile(EXCHANGE_INFO_FILENAME, this.#exchangeInfo).then(() => {
			logger.log('Cache file successfully written.')
		})
	}

	get fetchComplete() {
		return this.#fetchPromise
	}

	get exchangeInfoLastUpdated() {
		return this.#exchangeInfo?.lastUpdated
	}
	/**
	 * @returns true if data not available or older than 24h
	 */
	isExchangeInfoObsolete() {
		if (!this.exchangeInfoLastUpdated) {
			return true
		}
		return Date.now() - this.exchangeInfoLastUpdated >= TWENTY_FOUR_HOURS
	}

	get availablePairs(): Pair[] {
		if (this.#exchangeInfo === undefined) {
			throw new Error('exchange info not available.')
		}
		return this.#exchangeInfo.data.symbols.map((s) => ({base: s.baseAsset, quote: s.quoteAsset}))
	}

	doesPairExist(base: string, quote: string) {
		if (this.#exchangeInfo === undefined) {
			throw new Error('exchange info not available.')
		}
		return this.availablePairs.some((pair) => pair.base === base && pair.quote === quote)
	}

	/**
	 * e.g. quote USDT will return all pairs USDT tradable pairs such as BTC/USDT, ETH/USDT, etc...
	 */
	getAllPairsOfQuote(quote: string) {
		return this.availablePairs.filter((pair) => pair.quote === quote)
	}
}

export const Binance = new BinanceAPI()
