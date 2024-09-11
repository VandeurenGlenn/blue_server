import {PORT, WS_PORT} from '@blueserver/api/constants'
import {CronJob} from 'cron'
import {HttpApiServer} from './http/index.js'
import {WSApiServer} from './ws/index.js'

import {init, updateCacheWithRemote, cache} from '@blueserver/api/cache'
import {PubSub} from '@blueserver/api/pubsub'

try {
	await init()
	if (cache.lastUpdated + 3600000 < Date.now()) {
		await updateCacheWithRemote()
	}
} catch {
	// no local data, so we update cache
	await updateCacheWithRemote()
}

PubSub.publishTop100()
PubSub.publishChange24h()
PubSub.publishChange1h()

const cronTime = '0 * * * *' // every hour
// const cronTime = '*/20 * * * * *' // every 20s
const job = new CronJob(cronTime, function () {
	updateCacheWithRemote()
})
job.start()

new HttpApiServer({port: PORT})
new WSApiServer({port: WS_PORT})
