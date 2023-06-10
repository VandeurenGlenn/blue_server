import fetch from 'node-fetch';
export default class HttpApiClient {
    async #fetch(endpoint) {
        const response = await fetch(`https://blue.leofcoin.org/${endpoint}`);
        return response.json();
    }
    top100() {
        return this.#fetch('top-100');
    }
}
//# sourceMappingURL=index.js.map