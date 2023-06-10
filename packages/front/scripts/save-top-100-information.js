// import {ServerApi} from '@blueserver/api';
import {env} from '@blueserver/env';
import {CoinMarketCap} from '@blueserver/api/coinmarketcap';

const cmc = new CoinMarketCap(env.coinmarketcap);

const listings = await cmc.getLatestListings(100);
const assets = await cmc.getListingInfo(listings.map((l) => l.id));
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
