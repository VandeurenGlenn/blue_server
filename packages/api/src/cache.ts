import {readFile, writeFile} from 'fs/promises'
import {dataBuilder, type BlueAsset} from './DataBuilder.js'
import type {GithubActivity, GithubProjectResponse} from './api/github.js'
import {CACHE_ROOT_DIRECTORY, LIST_SIZE as DEFAULT_LIST_SIZE, LOCAL_DATA_FILENAME} from './constants.js'
import {PubSub} from './pubsub.js'
import {join} from 'node:path'
import {mkdir} from 'node:fs/promises'

export type BlueCache = {
	bluelist: BlueAsset[]
	// subscribe: typeof pubsub.subscribe
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
	cache.github.repos.cached = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'repos.json'))).toString())
	cache.github.repos.tags = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'tags.json'))).toString())
	cache.github.stats.cached = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'stats.json'))).toString())
	cache.github.stats.tags = JSON.parse((await readFile(join(CACHE_ROOT_DIRECTORY, 'statTags.json'))).toString())
	return cache.bluelist
}

export async function updateCacheWithRemote() {
	cache.bluelist = await dataBuilder.createAssetList(DEFAULT_LIST_SIZE)
	PubSub.publishTop100()
	PubSub.publishChange24h()

	try {
		// Making sure cache directory exists
		mkdir(CACHE_ROOT_DIRECTORY)
	} catch {
		// Ignore if it does
	}

	writeFile(join(CACHE_ROOT_DIRECTORY, 'cache.json'), JSON.stringify(cache.bluelist))
	writeFile(join(CACHE_ROOT_DIRECTORY, 'last-updated.txt'), Date.now().toString())

	await writeFile(join(CACHE_ROOT_DIRECTORY, 'repos.json'), JSON.stringify(cache.github.repos.cached))
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'tags.json'), JSON.stringify(cache.github.repos.tags))
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'stats.json'), JSON.stringify(cache.github.stats.cached))
	await writeFile(join(CACHE_ROOT_DIRECTORY, 'statTags.json'), JSON.stringify(cache.github.stats.tags))

	return cache.bluelist
}
