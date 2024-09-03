import {env} from '@blueserver/env'
import {CronCommand, CronJob} from 'cron'
import {HttpApiServer} from '@blueserver/api/server/http'
import {WSApiServer} from '@blueserver/api/server/ws'
import {PORT, WS_PORT} from '@blueserver/api/constants'

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

new HttpApiServer({port: PORT})
new WSApiServer({port: WS_PORT})
