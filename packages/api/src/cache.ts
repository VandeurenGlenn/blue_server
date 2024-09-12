import {readFile, writeFile} from 'fs/promises'
import {mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {dataBuilder} from './DataBuilder.js'
import {CACHE_ROOT_DIRECTORY, LIST_SIZE, TWENTY_FOUR_HOURS} from './constants.js'
import {PubSub} from './pubsub.js'
import {Binance} from './api/Binance.js'

export async function createCacheDirectory() {
	try {
		// Making sure cache directory exists
		await mkdir(CACHE_ROOT_DIRECTORY)
	} catch {
		// Ignore if it does
	}
}

interface BlueCache {
	bluelist: BlueAsset[]
	exchanges: {
		kraken: {
			lastUpdated: number
			list: KrakenAssetList['result']
		}
	}
	lastUpdated: number
	github: {
		repos: {
			cached: {
				[name: string]: GithubProjectResponse[]
			}
			tags: {[name: string]: string}
		}
		stats: {
			cached: {[name: string]: GithubActivity}
			tags: {[name: string]: string}
		}
	}
}

export const cache: BlueCache = {
	bluelist: [],
	exchanges: {
		kraken: {
			lastUpdated: 0,
			list: {}
		}
	},
	lastUpdated: 0,
	// subscribe: pubsub.subscribe.bind(pubsub),
	github: {
		repos: {
			cached: {},
			tags: {}
		},
		stats: {
			cached: {},
			tags: {}
		}
	}
}

export async function init() {
	cache.bluelist = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'cache.json'))).toString())
	cache.lastUpdated = parseInt((await readFile(join(CACHE_ROOT_DIRECTORY, 'last-updated.txt'))).toString())

	cache.github.repos.cached = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'repos.json'))).toString())
	cache.github.repos.tags = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'tags.json'))).toString())
	cache.github.stats.cached = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'stats.json'))).toString())
	cache.github.stats.tags = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'statTags.json'))).toString())

	return cache.bluelist
}

export async function updateCacheWithRemote() {
	// we only update the cache exchanges cache every 24 hours
	if (Date.now() - cache.exchanges.kraken.lastUpdated >= TWENTY_FOUR_HOURS) {
		cache.exchanges.kraken.list = await dataBuilder.createKrakenAssetList()
		cache.exchanges.kraken.lastUpdated = Date.now()
	}

	if (Binance.isExchangeInfoObsolete()) {
		await Binance.fetchExchangeInfo()
	}

	cache.bluelist = await dataBuilder.createAssetList(LIST_SIZE)
	PubSub.publishTop100()
	PubSub.publishChange24h()
	PubSub.publishChange1h()

	await createCacheDirectory()

	writeFile(join(CACHE_ROOT_DIRECTORY, 'cache.json'), JSON.stringify(cache.bluelist))
	writeFile(join(CACHE_ROOT_DIRECTORY, 'last-updated.txt'), Date.now().toString())

	await writeFile(join(CACHE_ROOT_DIRECTORY, 'repos.json'), JSON.stringify(cache.github.repos.cached))
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'tags.json'), JSON.stringify(cache.github.repos.tags))
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'stats.json'), JSON.stringify(cache.github.stats.cached))
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'statTags.json'), JSON.stringify(cache.github.stats.tags))

	return cache.bluelist
}
