import {env} from '@blueserver/env'
import {CronCommand, CronJob} from 'cron'
import {HttpApiServer} from '@blueserver/api/server/http'
import {cache, updateCacheWithRemote, init as initCache} from '@blueserver/api/cache'

// try {
// const cache = await initCache()
// } catch {
// no local data, so we update cache
await updateCacheWithRemote()
// }

// fetch remotely every hour
const job = new CronJob('0 * * * *', updateCacheWithRemote as unknown as CronCommand<any>)
job.start()

new HttpApiServer({port: env.port})
