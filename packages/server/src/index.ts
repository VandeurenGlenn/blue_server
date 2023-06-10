import {env} from './envs.js';
import Koa from 'koa';
import cors from 'koa-cors';
import Router from 'koa-router';
import {CronJob} from 'cron';
import {cache, updateCacheWithRemote, init as initCache} from '@blueserver/cache';

async function loadData() {
	try {
		await initCache()
		return cache.bluelist;
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
