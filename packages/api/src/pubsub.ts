import LittlePubSub from '@vandeurenglenn/little-pubsub'
import {cache} from './cache.js'
import {type AvailableRoute} from './constants.js'
import {API} from './api.js'

declare global {
	var pubsub: LittlePubSub
}

globalThis.pubsub = globalThis.pubsub || new LittlePubSub()

export class PubSub {
	static subscribe(route: AvailableRoute, callback: (data: any) => void) {
		pubsub.subscribe(route, callback)
	}

	// TODO: more type inconsistencies coming from your lib glenn, fix it >.<
	static publish<T = any>(event: AvailableRoute, data: T) {
		// @ts-ignore
		pubsub.publish(event, data)
	}

	static publishTop100() {
		pubsub.publish('top100', cache.bluelist)
	}
	/**
	 * Publishes the change24h event
	 * sends daily changes to the client
	 * should only be used when the client has selected to view the 24h changes
	 *
	 * @static
	 * @memberof PubSub
	 * @returns {void}
	 * @example
	 * PubSub.publishChange24h()
	 *
	 */
	static publishChange24h() {
		pubsub.publish('change24h', API.change24h()!)
	}

	/**
	 * Publishes the change1h event
	 * sends hourly changes to the client
	 * should only be used when the client has selected to view the 1h changes
	 *
	 * @static
	 * @memberof PubSub
	 * @returns {void}
	 * @example
	 * PubSub.publishChange1h()
	 *
	 */
	static publishChange1h() {
		pubsub.publish('change1h', API.change1h()!)
	}
}
