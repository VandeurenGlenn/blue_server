// @ts-ignore
import SocketRequestClient from 'socket-request-client';
export default class WSApiClient {
    // @ts-ignore
    #client;
    constructor() {
        this.#init();
    }
    async #init() {
        this.#client = new SocketRequestClient('ws://blue.leofcoin.org', 'protocol-blue');
        this.#client.init();
    }
    top100() {
        return this.#client.request({ url: 'top-100' });
    }
    subscribe(event, cb) {
        return this.#client.pubsub.subscribe(event, cb);
    }
}
//# sourceMappingURL=index.js.map