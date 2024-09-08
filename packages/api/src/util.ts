export function resolveLocalIP() {
	try {
		const url = new URL(import.meta.url)
		return url.hostname
	} catch (_er) {
		console.log(_er)
		return undefined
	}
}
