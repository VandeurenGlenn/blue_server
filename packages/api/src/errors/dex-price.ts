export default class DEXPriceError extends Error {
	#message: string

	constructor(message: string) {
		super(message)
		this.#message = message
		this.name = 'DEXPriceError'
	}
	get message() {
		return `${this.name}: ${this.#message}`
	}
}
