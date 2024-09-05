import {PORT, WS_PORT} from '@blueserver/api/constants'
import {CronJob} from 'cron'
import {HttpApiServer} from './http/index.js'
import {WSApiServer} from './ws/index.js'

import {cache, init, updateCacheWithRemote} from '@blueserver/api/cache'

// todo: check if cache can be used, if not, update cache & if in dev mode update also
try {
	await init()
	if (cache.lastUpdated + 3600000 < Date.now() || import.meta?.env.DEV) {
		await updateCacheWithRemote()
	}
} catch {
	// no local data, so we update cache
	await updateCacheWithRemote()
}

// fetch remotely every hour
job.start()

new HttpApiServer({port: PORT})
new WSApiServer({port: WS_PORT})
