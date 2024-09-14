import {createCacheDirectory} from '@blueserver/api/cache'
import {PORT, WS_PORT} from '@blueserver/api/constants'
import {cmcTicker, githubTicker} from '@blueserver/api/tickers'
import ms from 'ms'
import {HttpApiServer} from './http/index.js'
import {WSApiServer} from './ws/index.js'

/**
 * Some inits
 */
// TODO: This probably needs a better place
await createCacheDirectory()

/**
 * Tickers
 */
cmcTicker.startTicker(ms('1h'), true)
githubTicker.startTicker(ms('5s'), true)

/**
 * Protocols
 */
new HttpApiServer({port: PORT})
new WSApiServer({port: WS_PORT})
