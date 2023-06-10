import {BlueCache, BlueAsset} from '@blueserver/types';
import {writeFile} from 'fs/promises';
import pathlib from 'path';
import {getTopBlueList} from './top.js';
import {LIST_SIZE, LOCAL_DATA_FILENAME} from './constants.js';
import {fileURLToPath} from 'url';

const __dirname = pathlib.dirname(fileURLToPath(import.meta.url));

export const cache: BlueCache = {
	bluelist: []
};

export async function updateCacheWithRemote() {
	cache.bluelist = await getTopBlueList(LIST_SIZE);
	writeFile(
		pathlib.join(__dirname, '..', LOCAL_DATA_FILENAME),
		JSON.stringify(cache.bluelist)
	);
	return cache.bluelist;
}
