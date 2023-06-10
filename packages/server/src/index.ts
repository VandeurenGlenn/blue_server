import {env} from './envs.js';
import {CronJob} from 'cron';
import { HttpApiServer } from '@blueserver/api/servers/http'
import {cache, updateCacheWithRemote, init as initCache} from './cache.js';

async function loadData() {
	try {
		await initCache()
		return cache.bluelist;
	} catch (_) {
		// no local data, so we update cache
		return updateCacheWithRemote();
	}
}
await loadData();

// fetch remotely every minute
const job = await new CronJob('* * * * *', updateCacheWithRemote);
job.start();

const httpApiServer = new HttpApiServer({port: env.port})
