import {CMCAsset, CMCListing} from '@blueserver/types';
import fetch from 'node-fetch';

export class CoinMarketCap {
	#headers = new Headers()

	constructor(key: string) {
		this.#headers.append('X-CMC_PRO_API_KEY', key);
	}

	/** [{ "id": "1", ... }] */
	async getLatestListings(top = 100) {
		const response = await fetch(
			`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=${top}`,
			{
				headers: this.#headers,
			}
		);
		return (await response.json() as
			{ data: CMCListing[] }
		).data;
	}

	/** { "1": { ... }} */
	async getListingInfo(listingIds: string[] | string) {
		if (!Array.isArray(listingIds)) listingIds = [listingIds];
		const response = await fetch(
			`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${listingIds.join(
				','
			)}`,
			{
				headers: this.#headers
			}
		);
		return (await response.json() as {
			data: {
				[listingId: number]: CMCAsset
			}
		}).data
	}
}
