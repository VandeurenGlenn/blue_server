import {env} from './envs.js';
import Koa from 'koa';
import cors from 'koa-cors';
import Router from 'koa-router';
import type {BlueCache} from '@blueserver/types';
import pathlib from 'path';
import {CronJob} from 'cron';
import {fileURLToPath} from 'url';
import {readFile, writeFile} from 'fs/promises';
import {getTopBlueList} from './top.js';
import {LIST_SIZE} from './constants.js';

const __dirname = pathlib.dirname(fileURLToPath(import.meta.url));

const dataFilename = 'data.json';

const cache: BlueCache = {
	bluelist: [],
};

async function loadCurrencies({local = false} = {}) {
	if (local) {
		// Get data from local
		try {
			cache.bluelist = JSON.parse(
				(await readFile(pathlib.join(__dirname, '..', dataFilename))).toString()
			);
		} catch (_) {
			// default
			cache.bluelist = await getTopBlueList(LIST_SIZE);
			await writeFile(
				pathlib.join(__dirname, '..', dataFilename),
				JSON.stringify(cache.bluelist)
			);
		}
	} else {
		// Get data from remote
		cache.bluelist = await getTopBlueList(LIST_SIZE);
		writeFile(
			pathlib.join(__dirname, '..', dataFilename),
			JSON.stringify(cache.bluelist)
		);
	}
}
await loadCurrencies({local: false});

// fetch remotely every minute
const job = await new CronJob('* * * * *', loadCurrencies);
job.start();

const router = new Router();

router.get('/top-100', async (ctx) => (ctx.body = cache.bluelist));

const server = new Koa();

server.use(cors({origin: '*'}));
server.use(router.routes()).use(router.allowedMethods());

server.listen(env.port);

console.log(`endpoint at http://localhost:${env.port}/top-100`);
