import {CronJob} from 'cron'
import {cache} from '../cache.js'
import log from '../log.js'
import {dataBuilder} from '../DataBuilder.js'
import {PubSub} from '../pubsub.js'

const cronTime = '*/1 * * * *' // every minute
const job = new CronJob(cronTime, async function () {
	if (cache.bluelist.length === 0) {
		log.print('Cache is empty, skipping update')
		return
	}
	for (const asset of cache.bluelist) {
		if (asset.source_code) {
			log.time(`[Github] Fetching ${asset.name}`)
			asset.github.repos = await dataBuilder.gitHub.transformRepos(asset.source_code)
			log.timeEnd(`[Github] Fetching ${asset.name}`)
			PubSub.publishTop100()
		}
	}
})
export default job
