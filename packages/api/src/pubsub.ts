import LittlePubSub from '@vandeurenglenn/little-pubsub'
import {cache} from './cache.js'

export interface ChangesList {
	id: number
	change24h: number
}

const pubsub = new LittlePubSub()

export class PubSub {
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
