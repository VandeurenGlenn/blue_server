import { apiHost } from "./globals.js";

export async function fetchInformation() {
	try {
		const r = await fetch(`${apiHost}/fake-data.json`)
		return await r.json()
	}
	catch (e) {
		throw e;
	}
}