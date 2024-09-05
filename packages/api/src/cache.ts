import {type GithubActivity} from '@blueserver/types'
import {readFile, writeFile} from 'fs/promises'
import {type GithubProjectResponse} from './api/github.js'
import {dataBuilder, type BlueAsset} from './DataBuilder.js'
import {LIST_SIZE as DEFAULT_LIST_SIZE, LOCAL_DATA_FILENAME} from './constants.js'
import LittlePubSub from '@vandeurenglenn/little-pubsub'

const pubsub = new LittlePubSub()

export type BlueCache = {
	bluelist: BlueAsset[]
	subscribe: typeof pubsub.subscribe
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
	subscribe: pubsub.subscribe.bind(pubsub),
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
	cache.bluelist = JSON.parse((await readFile(LOCAL_DATA_FILENAME)).toString())
	cache.lastUpdated = parseInt((await readFile('last-updated.txt')).toString())
	cache.github.repos.cached = JSON.parse((await readFile('./repos.json')).toString())
	cache.github.repos.tags = JSON.parse((await readFile('./tags.json')).toString())
	cache.github.stats.cached = JSON.parse((await readFile('./stats.json')).toString())
	cache.github.stats.tags = JSON.parse((await readFile('./statTags.json')).toString())
	return cache.bluelist
}

export async function updateCacheWithRemote() {
	cache.bluelist = await dataBuilder.createAssetList(DEFAULT_LIST_SIZE)
	pubsub.publish('top100', cache.bluelist)
	pubsub.publish(
		'change24h',
		cache.bluelist.map((a) => ({id: a.id, change: a.change24h}))
	)

	writeFile(LOCAL_DATA_FILENAME, JSON.stringify(cache.bluelist))
	writeFile('last-updated.txt', Date.now().toString())

	// Just to test
	await writeFile('./repos.json', JSON.stringify(cache.github.repos.cached))
	await writeFile('./tags.json', JSON.stringify(cache.github.repos.tags))
	await writeFile('./stats.json', JSON.stringify(cache.github.stats.cached))
	await writeFile('./statTags.json', JSON.stringify(cache.github.stats.tags))

	return cache.bluelist
}
