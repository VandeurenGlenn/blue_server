import {dirname} from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)

/**
 * This import should only be used by scripts present in the same
 * directory as this module because dirname will always be
 * equal to this module's directory and not of the calling script.
 */
export const __dirname = dirname(__filename)
