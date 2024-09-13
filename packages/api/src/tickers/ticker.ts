import {ReactiveObject} from 'snar'
import {Logger} from '../log.js'
import {type ChalkInstance} from 'chalk'

export abstract class Ticker extends ReactiveObject {
	protected tickerPromise = Promise.resolve()
	protected running = false
	protected waitPromise: Promise<void> | undefined = undefined
	protected waitPromiseResolve: (() => void) | undefined = undefined
	protected waitStartedAt: number | undefined = undefined
	protected waitIntervalMs: number | undefined = undefined
	protected waitTimeout: NodeJS.Timeout | undefined = undefined
	protected logger: Logger

	constructor(
		protected name: string,
		protected color: ChalkInstance
	) {
		super()
		this.logger = new Logger(name, color)
	}

	get tickerComplete() {
		return this.tickerPromise
	}

	/**
	 * @param needToWait set to false if you want the ticker call to run on start
	 *                   this value will automatically set to true after first call to wait
	 *                   between every batch.
	 */
	async startTicker(intervalMs: number, needToWait = false) {
		this.waitIntervalMs = intervalMs
		this.running = true
		while (this.running) {
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

			if (this.running) {
				this.tickerCallWrapper()
			}
		}
	}

	private async tickerCallWrapper() {
		let tickerEndResolve!: () => void
		this.tickerPromise = new Promise((resolve) => (tickerEndResolve = resolve))
		await this.tickerCall()
		tickerEndResolve()
	}

	goToNextBatch(initiator: Ticker) {
		const initiatorName = initiator === this ? 'self' : initiator.name
		this.logger.log(`going to next batch (initiator: ${initiatorName})`)
		this.waitPromiseResolve?.()
	}

	stopTicker() {
		this.running = false
		this.goToNextBatch(this) // this will just stop the wait and terminate the ticker.
	}

	getTimeLeftRatio() {
		if (this.waitStartedAt === undefined || this.waitIntervalMs === undefined) {
			throw new Error("Can't determine time left.")
		}
		const timespent = Date.now() - this.waitStartedAt
		const ratio = timespent / this.waitIntervalMs
		return Math.min(ratio, 1)
	}

	isRunning() {
		return this.running
	}

	abstract tickerCall(): Promise<void>
}
