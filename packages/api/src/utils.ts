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

export function deepClone<T>(object: T | undefined): T | undefined {
	if (object === undefined) {
		return undefined
	}
	try {
		return JSON.parse(JSON.stringify(object)) as T
	} catch (error) {
		return undefined
	}
}

export function filterObject<T extends object, K extends keyof T>(obj: T, keysToKeep: K[]): Pick<T, K> {
	return Object.fromEntries(keysToKeep.map((key) => [key, obj[key]])) as Pick<T, K>
}
