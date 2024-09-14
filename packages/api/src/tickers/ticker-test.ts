// TODO: remove this file from repo
import ms from 'ms'
import {cmcTicker} from './coinmarketcap.js'
import {createCacheDirectory} from '../cache.js'
import {githubTicker} from './github.js'

await createCacheDirectory()
cmcTicker.startTicker(ms('10s'))
await new Promise((r) => setTimeout(r, 100))
githubTicker.startTicker(ms('5s'), false)
