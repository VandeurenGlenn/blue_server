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
	log.time('Updating GitHub repos')
	const promises = []
	const job = async (asset: BlueAsset) => {
		if (asset.source_code) {
			asset.github.repos = await dataBuilder.gitHub.transformRepos(asset.source_code)
			PubSub.publishTop100()
		}
	}
	for (const asset of cache.bluelist) {
		promises.push(job(asset))
	}
	await Promise.all(promises)
	log.timeEnd('Updating GitHub repos')
})
export default job
