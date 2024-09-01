import fetch from 'node-fetch';
import {type BlueAsset} from '../../DataBuilder.js';

export class HttpApiClient {
	async #fetch(endpoint: string) {
		const response = await fetch(`https://blue.leofcoin.org/${endpoint}`);
		return response.json();
	}

	top100() {
		return this.#fetch('top-100') as Promise<BlueAsset[]>;
	}
}
