import {ReactiveObject} from 'snar'
import {Logger} from '../log.js'
import {type ChalkInstance} from 'chalk'

export abstract class Ticker extends ReactiveObject {
	#tickerPromise = Promise.resolve()
	/**
	 * flag to determine if the ticker is currently activated or not.
	 * notice: not to confuse with `running` !
	 */
	#tickering = false
	/**
	 * flag to determine if the ticker is currently inside a call or not
	 */
	#running = false
	protected waitPromise: Promise<void> | undefined = undefined
	protected waitPromiseResolve: (() => void) | undefined = undefined
	protected waitStartedAt: number | undefined = undefined
	protected waitIntervalMs: number | undefined = undefined
	protected waitTimeout: NodeJS.Timeout | undefined = undefined
	protected logger: Logger
	#runStartedAt: number | undefined

	constructor(
		protected name: string,
		protected color: ChalkInstance,
		protected silent = false
	) {
		super()
		this.logger = new Logger(name, color, !silent)
	}

	get runComplete() {
		return this.#tickerPromise
	}

	get running() {
		return this.#tickering && this.#running
	}

	get paused() {
		return this.#tickering && !this.running
	}
	get stopped() {
		return !this.#tickering
	}

	setStart() {
		this.logger.log('ticker run starting')
		this.#runStartedAt = Date.now()
		this.#running = true
	}
	setEnd() {
		if (this.#runStartedAt === undefined) {
			throw new Error("Can't determine the running time because `setStart` hasn't been called prior to this function.")
		}
		const runTime = (Date.now() - this.#runStartedAt) / 1000
		this.logger.log(`ticker run COMPLETED (${runTime}s)`)
		this.#running = false
	}

	/**
	 * @param needToWait set to false if you want the ticker call to run on start
	 *                   this value will automatically set to true after first call to wait
	 *                   between every run.
	 */
	async startTicker(intervalMs: number, needToWait = false) {
		this.waitIntervalMs = intervalMs
		this.#tickering = true
		while (this.#tickering) {
			if (needToWait) {
				this.waitStartedAt = Date.now()
				await new Promise<void>((resolve) => {
					this.waitPromiseResolve = resolve
					this.waitTimeout = setTimeout(resolve, this.waitIntervalMs)
				})
				clearTimeout(this.waitTimeout)
				this.waitTimeout = undefined
			}
			needToWait = true

			// RUN!
			this.#runStartedAt = undefined // Because this is user-defined we make sure it's not defined on a new run
			this.#running = false // Same for that, we don't assume if it's running until the user explictily call `setStart`
			if (this.#tickering) {
				this.#tickerCallWrapper()
			}
		}
	}

	async #tickerCallWrapper() {
		let tickerEndResolve!: () => void
		this.#tickerPromise = new Promise((resolve) => (tickerEndResolve = resolve))
		try {
			this.logger.log('ticker call starts')
			await this.tickerCall()
			this.logger.log('ticker call ends')
		} catch {
		} finally {
			tickerEndResolve()
		}
	}

	goToNextRun(initiator: Ticker) {
		if (!this.#tickering) {
			return
		}
		const initiatorName = initiator === this ? 'self' : initiator.name
		this.logger.log(`going to next batch (initiator: ${initiatorName})`)
		this.waitPromiseResolve?.() // This causes the wait to break and run the next call
	}

	stopTicker() {
		this.#tickering = false
		this.goToNextRun(this) // this will just stop the wait and terminate the ticker.
	}

	getTimeLeftRatio() {
		if (this.waitStartedAt === undefined || this.waitIntervalMs === undefined) {
			throw new Error("Can't determine time left.")
		}
		const timespent = Date.now() - this.waitStartedAt
		const ratio = timespent / this.waitIntervalMs
		return 1 - Math.min(ratio, 1)
	}

	isTickering() {
		return this.#tickering
	}

	abstract tickerCall(): Promise<void>
}
