import {env} from './envs.js';
import {CronJob} from 'cron';
import {HttpApiServer} from '@blueserver/api/server/http';
import {
	cache,
	updateCacheWithRemote,
	init as initCache,
} from '@blueserver/api/cache';

async function loadData() {
	try {
		await initCache();
		return cache.bluelist;
	} catch (_) {
		// no local data, so we update cache
		return updateCacheWithRemote();
	}
}
await loadData();

// fetch remotely every minute
const job = new CronJob('0 * * * * *', updateCacheWithRemote);
job.start();

new HttpApiServer({port: env.port});
