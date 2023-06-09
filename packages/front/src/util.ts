import { ENDPOINT } from "./constants.js";

export async function getBlueList() {
	try {
		const r = await fetch(ENDPOINT)
		return await r.json()
	}
	catch (e) {
		throw e;
	}
}

export function getCmcLogoSrcUrl (assetId: number) {
	return `https://s2.coinmarketcap.com/static/img/coins/64x64/${assetId}.png`
}