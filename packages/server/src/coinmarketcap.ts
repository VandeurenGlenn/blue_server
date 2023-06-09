import {CMCAsset as CMCAsset, CMCListing} from '@blueserver/types';
import {env} from './envs.js';

const headers = new Headers();
headers.append('X-CMC_PRO_API_KEY', env.coinmarketcap);

export class CoinMarketCap {
	/** [{ "id": "1", ... }] */
	static async getTopListings(top = 100) {
		const response = await fetch(
			`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=${top}`,
			{
				headers,
			}
		);
		return (await response.json()).data as CMCListing[];
	}

	/** { "1": { ... }} */
	static async getListingInfo(listingIds: string[] | string) {
		if (!Array.isArray(listingIds)) listingIds = [listingIds];
		const response = await fetch(
			`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${listingIds.join(
				','
			)}`,
			{headers}
		);
		return (await response.json()).data as {
			[listingId: number]: CMCAsset;
		};
	}
}
