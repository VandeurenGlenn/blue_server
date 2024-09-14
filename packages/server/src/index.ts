import {createCacheDirectory} from '@blueserver/api/cache'
import {PORT, WS_PORT} from '@blueserver/api/constants'
import {cmcTicker, githubTicker, dexTicker} from '@blueserver/api/tickers'
import ms from 'ms'
import {HttpApiServer} from './http/index.js'
import {WSApiServer} from './ws/index.js'

/**
 * Some inits
 */
await createCacheDirectory()

/**
 * Tickers
 */
cmcTicker.startTicker(ms('1h'), true)
githubTicker.startTicker(ms('5m'), true)
dexTicker.startTicker(ms('1m'), true)

/**
 * Protocols
 */
new HttpApiServer({port: PORT})
new WSApiServer({port: WS_PORT})
