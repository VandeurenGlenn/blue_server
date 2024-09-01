import dotenv from 'dotenv'
import pathlib from 'path'
import {fileURLToPath} from 'url'

export interface DotEnvKeys {
	coinmarketcap: string
	github: string
	port: number
}

const __dirname = pathlib.dirname(fileURLToPath(import.meta.url))

const _env = dotenv.config({
	path: pathlib.join(__dirname, '..', '.env')
}).parsed as unknown as DotEnvKeys | undefined

// Required to exit the program nicely
// and remove undefined errors further in the code.
if (_env === undefined) {
	console.log('env vars not found')
	process.exit(0)
}

export const env = _env as DotEnvKeys
