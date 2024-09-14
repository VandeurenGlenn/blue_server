import {env} from '@blueserver/env'
import chalk from 'chalk'
import fetch, {type Response} from 'node-fetch'
import {readCacheFile, writeCacheFile, type CacheFileData} from '../cache.js'
import {LIST_SIZE, TWENTY_FOUR_HOURS} from '../constants.js'
import {Logger} from '../log.js'

const logger = new Logger('api (cmc)', chalk.magenta)

const CMC_LISTINGS_FILENAME = 'cmc-listings.json'
const CMC_LISTINGS_INFO_FILENAME = 'cmc-listings-info.json'

interface CMCListingsResponse {
	data: CMCListing[]
}
interface CMCListingsInfoResponse {
	data: {
		[listingId: number]: CMCAsset
	}
}

export class CoinMarketCapAPI {
	#listings: CacheFileData<CMCListingsResponse> | undefined = undefined
	#listingsInfo: CacheFileData<CMCListingsInfoResponse> | undefined = undefined

	#headers = new Headers()

	constructor(key: string) {
		this.#headers.append('X-CMC_PRO_API_KEY', key)

		this.#loadListings()
		this.#loadListingsInfo()
	}

	async #loadListings() {
		try {
			this.#listings = await readCacheFile(CMC_LISTINGS_FILENAME)
		} catch (e) {
			logger.log("Couldn't load listings.")
		}
	}
	#fetchListingsPromise: Promise<Response> | undefined
	async fetchListings() {
		logger.log('Fetching remote listings.')
		const past = Date.now()
		this.#fetchListingsPromise = fetch(
			// TODO: fetch bigger listings e.g. 200
			`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=${LIST_SIZE}`,
			{headers: this.#headers}
		)
		const response = await this.#fetchListingsPromise
		const now = Date.now()
		logger.log(`Listings Fetched in ${(now - past) / 1000}s`)
		this.#listings = {
			lastUpdated: now,
			data: (await response.json()) as CMCListingsResponse
		}
		writeCacheFile(CMC_LISTINGS_FILENAME, this.#listings).then(() => {
			logger.log('Listings cache file successfully written.')
		})
	}
	isListingsObsolete() {
		if (!this.#listings?.lastUpdated) {
			return true
		}
		return Date.now() - this.#listings.lastUpdated >= TWENTY_FOUR_HOURS
	}

	async #loadListingsInfo() {
		try {
			this.#listingsInfo = await readCacheFile(CMC_LISTINGS_INFO_FILENAME)
		} catch (e) {
			logger.log("Couldn't load listings info.")
		}
	}
	#fetchListingsInfoPromise: Promise<Response> | undefined
	async fetchListingsInfo(listingIds: number[] | number | undefined) {
		if (listingIds === undefined) {
			listingIds = this.getListingsInfoMap().map((l) => l.id)
		}
		if (!Array.isArray(listingIds)) {
			listingIds = [listingIds]
		}
		logger.log('Fetching remote listings info.')
		const past = Date.now()
		this.#fetchListingsInfoPromise = fetch(
			`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${listingIds.join(',')} `,
			{headers: this.#headers}
		)
		const response = await this.#fetchListingsInfoPromise
		const now = Date.now()
		logger.log(`Listings Info Fetched in ${(now - past) / 1000}s`)
		this.#listingsInfo = {
			lastUpdated: now,
			data: (await response.json()) as CMCListingsInfoResponse
		}
		writeCacheFile(CMC_LISTINGS_INFO_FILENAME, this.#listingsInfo).then(() => {
			logger.log('Listings Info cache file successfully written.')
		})
	}
	isListingsInfoObsolete() {
		if (!this.#listingsInfo?.lastUpdated) {
			return true
		}
		return Date.now() - this.#listingsInfo.lastUpdated >= TWENTY_FOUR_HOURS
	}

	isDataObsolete() {
		return this.isListingsObsolete() || this.isListingsInfoObsolete()
	}

	get fetchComplete() {
		return Promise.all([this.#fetchListingsPromise, this.#fetchListingsInfoPromise])
	}

	/**
	 * Get listings of the last fetch
	 */
	getListings(top = LIST_SIZE) {
		if (this.#listings === undefined) {
			throw new Error('Listings data not available. Make sure to wait for the fetch to complete.')
		}
		return this.#listings.data.data.slice(0, top)
	}

	/**
	 * Get listings info map of the last fetch
	 */
	getListingsInfoMap() {
		if (this.#listingsInfo === undefined) {
			throw new Error('Listings data not available. Make sure to wait for the fetch to complete.')
		}
		return Object.values(this.#listingsInfo.data.data)
	}
}

export const CoinMarketCap = new CoinMarketCapAPI(env.coinmarketcap)
