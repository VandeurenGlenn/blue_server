import {__dirname} from './__dirname.js'
import {join} from 'path'

export const SEVEN_DAYS_AGO = 604_800_000
export const TWENTY_FOUR_HOURS = 86_400_000
export const LIST_SIZE = 100
export const PORT = 9876
export const WS_PORT = 9877
export const protocol = 'protocol-blue'

// One directory down because this script operates from 'lib' not the root
export const CACHE_ROOT_DIRECTORY = join(__dirname, '..', '.cache')
export const COINBASE_CACHE_FILENAME = 'coinbase-asset-list.json'
export const KRAKEN_CACHE_FILENAME = 'kraken-asset-list.json'

export const availableRoutes = ['top100', 'change24h'] as const

export type AvailableRoute = (typeof availableRoutes)[number]
