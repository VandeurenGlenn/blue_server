import { BlueAsset } from '@blueserver/types'
import fetch from 'node-fetch'

export class HttpApiClient {
  async #fetch(endpoint: string) {
    const response = await fetch(`https://blue.leofcoin.org/${endpoint}`)
    return response.json()
  }

  top100() {
    return this.#fetch('top-100') as Promise<BlueAsset[]> 
  }
  top100Ids() {
    return this.#fetch('top-100-ids') as Promise<string | number[]> 
  }
}