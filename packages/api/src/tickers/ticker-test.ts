// TODO: remove this file from repo
import ms from 'ms'
import {coinMarketCapTicker} from './coinmarketcap.js'
import {createCacheDirectory} from '../cache.js'
import {githubTicker} from './github.js'

await createCacheDirectory()
coinMarketCapTicker.startTicker(ms('10s'))
await new Promise((r) => setTimeout(r, 100))
githubTicker.startTicker(ms('1s'))
