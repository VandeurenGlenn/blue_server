import {readFile, writeFile} from 'fs/promises'
import {mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {dataBuilder} from './DataBuilder.js'
import {CACHE_ROOT_DIRECTORY, LIST_SIZE, TWENTY_FOUR_HOURS} from './constants.js'
import {PubSub} from './pubsub.js'

export async function createCacheDirectory() {
	try {
		// Making sure cache directory exists
		await mkdir(CACHE_ROOT_DIRECTORY)
	} catch {
		// Ignore if it does
	}
}

export const cache: BlueCache = {
	bluelist: [],
	exchanges: {
		binance: {
			lastUpdated: 0,
			list: []
		},
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

export const init = async () => {
	cache.bluelist = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'cache.json'))).toString())
	cache.lastUpdated = parseInt((await readFile(join(CACHE_ROOT_DIRECTORY, 'last-updated.txt'))).toString())
	cache.exchanges = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'exchanges.json'))).toString())

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
	if (Date.now() - cache.exchanges.binance.lastUpdated >= TWENTY_FOUR_HOURS) {
		cache.exchanges.binance.list = await dataBuilder.createBinanceAssetList()
		cache.exchanges.binance.lastUpdated = Date.now()
	}

	cache.bluelist = await dataBuilder.createAssetList(LIST_SIZE)
	PubSub.publishTop100()
	PubSub.publishChange24h()
	PubSub.publishChange1h()

	await createCacheDirectory()

	writeFile(join(CACHE_ROOT_DIRECTORY, 'cache.json'), JSON.stringify(cache.bluelist))
	writeFile(join(CACHE_ROOT_DIRECTORY, 'last-updated.txt'), Date.now().toString())
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'exchanges.json'), JSON.stringify(cache.exchanges))

	await writeFile(join(CACHE_ROOT_DIRECTORY, 'repos.json'), JSON.stringify(cache.github.repos.cached))
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'tags.json'), JSON.stringify(cache.github.repos.tags))
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'stats.json'), JSON.stringify(cache.github.stats.cached))
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'statTags.json'), JSON.stringify(cache.github.stats.tags))

	return cache.bluelist
}
