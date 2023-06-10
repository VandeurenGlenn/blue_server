// import pathlib from 'path';
// import {getTopBlueList} from '@blueserver/api';
import { ServerApi } from './api/api.js'
// import {LIST_SIZE, LOCAL_DATA_FILENAME} from './constants.js';
// import {fileURLToPath} from 'url';
import { writeFile, readFile } from 'fs/promises';

// const __dirname = pathlib.dirname(fileURLToPath(import.meta.url));
import {env} from '@blueserver/server/envs'
import {LIST_SIZE, LOCAL_DATA_FILENAME} from '@blueserver/server/constants'
import { BlueCache } from '@blueserver/types';

const api = new ServerApi(env)

export const cache: BlueCache = {
	bluelist: [],
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
	try {
    cache.bluelist = JSON.parse((await readFile(LOCAL_DATA_FILENAME)).toString())
		cache.github.repos.cached = JSON.parse((await readFile('./repos.json')).toString())
		cache.github.repos.tags = JSON.parse((await readFile('./tags.json')).toString())
		cache.github.stats.cached = JSON.parse((await readFile('./stats.json')).toString())
		cache.github.stats.tags = JSON.parse((await readFile('./statTags.json')).toString())
	} catch (error) {
		return []
	}
	return cache.bluelist
}

export async function updateCacheWithRemote() {
	cache.bluelist = await api.top100(LIST_SIZE);
		writeFile(
			LOCAL_DATA_FILENAME,
			JSON.stringify(cache.bluelist)
		)

	// Just to test
	await writeFile('./repos.json', JSON.stringify(cache.github.repos.cached))
	await writeFile('./tags.json', JSON.stringify(cache.github.repos.tags))
	await writeFile('./stats.json', JSON.stringify(cache.github.stats.cached))
	await writeFile('./statTags.json', JSON.stringify(cache.github.stats.tags))

	return cache.bluelist;
}
