import {CronJob} from 'cron';
import { HttpApiServer } from '@blueserver/api/server/http'
import {cache, updateCacheWithRemote, init as initCache} from '@blueserver/api/cache';

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

// TODO: move this value to a constant file
const port = 9876

const httpApiServer = new HttpApiServer({port})
