import {cache} from '@blueserver/api/cache'

export const top100 = (): Top100ResponseLoad => {
	return {list: cache.bluelist, lastUpdated: cache.lastUpdated}
}

export const change24h = (): ChangesList[] => {
	return cache.bluelist.map<ChangesList>((a) => ({id: a.id, change: a.changes.percent_24h}))
}

export const change1h = (): ChangesList[] => {
	return cache.bluelist.map<ChangesList>((a) => ({id: a.id, change: a.changes.percent_1h}))
}
