import {type ChalkInstance} from 'chalk'

let silent = false
/**
 * @deprecated
 */
export default {
	silence() {
		silent = true
	},

	print(input: any) {
		if (silent) {
			return
		}
		console.log(input)
	},
	time(input: string) {
		if (silent) {
			return
		}
		console.time(input)
	},
	timeEnd(input: string) {
		if (silent) {
			return
		}
		console.timeEnd(input)
	}
}

export class Logger {
	constructor(
		protected name: string,
		protected color: ChalkInstance,
		protected enabled = true
	) {}

	log(message: any) {
		if (process.env.NODE_ENV === 'production' || !this.enabled) {
			return
		}
		console.log(this.color(`[${this.name.toUpperCase()}] ${message}`))
	}
}
