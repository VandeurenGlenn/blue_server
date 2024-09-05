import LittlePubSub from '@vandeurenglenn/little-pubsub'
import {cache} from './cache.js'
import {type AvailableRoute} from './constants.js'

export interface ChangesList {
	id: number
	change24h: number
}

const pubsub = new LittlePubSub()

export class PubSub {
	static subscribe(route: AvailableRoute, callback: (data: any) => void) {
		pubsub.subscribe(route, callback)
	}

	static publishTop100() {
		pubsub.publish('top100', cache.bluelist)
	}

	static publishChange24h() {
		pubsub.publish(
			'change24h',
			cache.bluelist.map<ChangesList>((a) => ({id: a.id, change24h: a.change24h}))
		)
	}
}
