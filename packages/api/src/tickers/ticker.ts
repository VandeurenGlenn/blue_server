const tickers = []

export function newTicker(name: string, ticker: Function, everyS: number) {
	const interval = setInterval(ticker, everyS)
	// TODO: save interval with name
}

export function stopTicker(name: string) {
	// TODO
}

export function getTicker(name) {
	return tickers.find((el) => el.name)
}
