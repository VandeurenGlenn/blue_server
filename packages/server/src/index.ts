import {env} from './envs.js';
import Koa from 'koa';
import cors from 'koa-cors';
import Router from 'koa-router';
import pathlib from 'path';
import {CronJob} from 'cron';
import {fileURLToPath} from 'url';
import {readFile} from 'fs/promises';
import {LOCAL_DATA_FILENAME} from './constants.js';
import {cache, updateCacheWithRemote} from './cache.js';

const __dirname = pathlib.dirname(fileURLToPath(import.meta.url));

async function loadData() {
	try {
		return (cache.bluelist = JSON.parse(
			(
				await readFile(pathlib.join(__dirname, '..', LOCAL_DATA_FILENAME))
			).toString()
		));
	} catch (_) {
		// no local data, we we update cache
		return updateCacheWithRemote();
	}
}
await loadData();

// fetch remotely every minute
const job = await new CronJob('* * * * *', updateCacheWithRemote);
job.start();

const router = new Router();

router.get('/top-100', async (ctx) => (ctx.body = cache.bluelist));

const server = new Koa();

server.use(cors({origin: '*'}));
server.use(router.routes()).use(router.allowedMethods());

server.listen(env.port);

console.log(`endpoint at http://localhost:${env.port}/top-100`);
