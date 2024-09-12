import {readFile, writeFile} from 'fs/promises'
import fetch, {type Response} from 'node-fetch'
import {join} from 'path'
import {CACHE_ROOT_DIRECTORY, TWENTY_FOUR_HOURS} from '../constants.js'
import log from '../log.js'

interface BinanceExchangeInfoResponse {
	symbols: [{baseAsset: string; quoteAsset: string}]
}
interface BinanceExchangeInfoCache {
	load: BinanceExchangeInfoResponse
	lastUpdated: number
}

const EXCHANGE_INFO_FILENAME = 'binance-exchange-info.json'

class BinanceAPI {
	#exchangeInfo: BinanceExchangeInfoCache | undefined
	#fetchPromise: Promise<Response> | undefined = undefined

	constructor() {
		this.#loadExchangeInfo().catch(() => {
			// Doesn't exist we fetch remotely
			this.fetchExchangeInfo()
		})
	}

	async #loadExchangeInfo() {
		try {
			this.#exchangeInfo = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, EXCHANGE_INFO_FILENAME))).toString())
		} catch {
			log.print("[binance] Couldn't load exchange info. Fetching remote...")
		}
	}

	async fetchExchangeInfo() {
		log.print('[binance] Fetching remote data.')
		const past = Date.now()
		this.#fetchPromise = fetch(`https://www.binance.com/api/v3/exchangeInfo`)
		const response = await this.#fetchPromise
		const now = Date.now()
		log.print(`[binance] Fetched in ${(now - past) / 1000}s`)
		this.#exchangeInfo = {
			lastUpdated: now,
			load: (await response.json()) as BinanceExchangeInfoResponse
		}
		writeFile(join(CACHE_ROOT_DIRECTORY, EXCHANGE_INFO_FILENAME), JSON.stringify(this.#exchangeInfo))
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
		return this.#exchangeInfo.load.symbols.map((s) => ({base: s.baseAsset, quote: s.quoteAsset}))
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
