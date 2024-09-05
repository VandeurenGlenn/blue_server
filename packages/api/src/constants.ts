export const SEVEN_DAYS_AGO = 604_800_000
export const LIST_SIZE = 100
export const LOCAL_DATA_FILENAME = 'data.json'
export const PORT = 9876
export const WS_PORT = 9877

export const availableRoutes = ['top100', 'change24h'] as const

export type AvailableRoute = (typeof availableRoutes)[number]
