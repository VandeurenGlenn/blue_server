import {writeFile} from 'fs/promises'
import {readFileSync} from 'fs'
import {mkdir} from 'node:fs/promises'
import {join} from 'node:path'
import {CACHE_ROOT_DIRECTORY, LIST_SIZE} from './constants.js'

export type CacheFileData<T = any> = {lastUpdated: number; data: T}

export function readCacheFile(filename: string) {
	const data = readFileSync(join(CACHE_ROOT_DIRECTORY, filename))
	return JSON.parse(data.toString())
}

export async function writeCacheFile(filename: string, data: CacheFileData) {
	return writeFile(join(CACHE_ROOT_DIRECTORY, filename), JSON.stringify(data))
}

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
	lastUpdated: number
	github: {
		repos: {
			cached: {
				[name: string]: GithubRepoResponse[]
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
	// cache.bluelist = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'cache.json'))).toString())
	// cache.lastUpdated = parseInt((await readFile(join(CACHE_ROOT_DIRECTORY, 'last-updated.txt'))).toString())
	//
	// cache.github.repos.cached = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'repos.json'))).toString())
	// cache.github.repos.tags = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'tags.json'))).toString())
	// cache.github.stats.cached = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'stats.json'))).toString())
	// cache.github.stats.tags = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'statTags.json'))).toString())
	//
	// return cache.bluelist
}

export async function updateCacheWithRemote() {
	// cache.bluelist = await dataBuilder.createAssetList(LIST_SIZE)
	// PubSub.publishTop100()
	// PubSub.publishChange24h()
	// PubSub.publishChange1h()
	//
	// await createCacheDirectory()
	//
	// writeFile(join(CACHE_ROOT_DIRECTORY, 'cache.json'), JSON.stringify(cache.bluelist))
	// writeFile(join(CACHE_ROOT_DIRECTORY, 'last-updated.txt'), Date.now().toString())
	//
	// await writeFile(join(CACHE_ROOT_DIRECTORY, 'repos.json'), JSON.stringify(cache.github.repos.cached))
	// await writeFile(join(CACHE_ROOT_DIRECTORY, 'tags.json'), JSON.stringify(cache.github.repos.tags))
	// await writeFile(join(CACHE_ROOT_DIRECTORY, 'stats.json'), JSON.stringify(cache.github.stats.cached))
	// await writeFile(join(CACHE_ROOT_DIRECTORY, 'statTags.json'), JSON.stringify(cache.github.stats.tags))
	//
	// return cache.bluelist
}
