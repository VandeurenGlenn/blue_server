import {__dirname} from './__dirname.js'
import {join} from 'node:path'

export const SEVEN_DAYS_AGO = 604_800_000
export const LIST_SIZE = 100
export const LOCAL_DATA_FILENAME = 'data.json'
export const PORT = 9876
export const WS_PORT = 9877

// One directory down because this script operates from 'lib' not the root
export const CACHE_ROOT_DIRECTORY = join(__dirname, '..', '.cache')

export const availableRoutes = ['top100', 'change24h'] as const

export type AvailableRoute = (typeof availableRoutes)[number]
