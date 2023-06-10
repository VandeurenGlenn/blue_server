// @ts-ignore
import SocketRequestClient from 'socket-request-client'
import { BlueAsset } from '@blueserver/types';


export class WSApiClient {
  // @ts-ignore
  #client;

  constructor() {
    this.#init() 
  }

  async #init() {
    this.#client = new SocketRequestClient('ws://blue.leofcoin.org', 'protocol-blue')
    this.#client.init()
  }

  top100(): Promise<BlueAsset[]> {
    return this.#client.request({ url: 'top-100' })
  }

  subscribe(event: string, cb: Function) {
    return this.#client.pubsub.subscribe(event, cb)
  }
}