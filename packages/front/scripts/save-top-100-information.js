import {getTopListings} from '@blueserver/server/top';
import {CoinMarketCap} from '@blueserver/server/coinmarketcap';
import fs from 'fs/promises';

const listings = await getTopListings(100);
const assets = await CoinMarketCap.getListingInfo(listings.map((l) => l.id));
fs.writeFile(
	'src/top100.json',
	JSON.stringify(
		Object.values(assets).map((asset) => {
			return {
				id: asset.id,
				name: asset.name,
				slug: asset.slug,
				symbol: asset.symbol,
				description: asset.description,
				// tags: asset.tags
			};
		})
	)
);
// console.log(top);
