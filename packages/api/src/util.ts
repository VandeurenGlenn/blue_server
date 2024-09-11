const decoder = new TextDecoder()
const encoder = new TextEncoder()

export function decode(buffer: Uint8Array) {
	return decoder.decode(buffer)
}

export function encode(string: string) {
	return encoder.encode(string)
}

export function resolveLocalIP() {
	try {
		const url = new URL(import.meta.url)
		return url.hostname
	} catch (_er) {
		console.log(_er)
		return undefined
	}
}

export async function hashIt(data: BufferSource) {
	const hashBuffer = await crypto.subtle.digest('SHA-256', data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
