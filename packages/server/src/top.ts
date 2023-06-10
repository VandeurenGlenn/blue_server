import {BlueAsset, CMCListing, GithubProjectResponse} from '@blueserver/types';
import {CoinMarketCap} from './coinmarketcap.js';
import {GitHub} from './github.js';
import {SEVEN_DAYS_AGO} from './constants.js';

/**
 *
 * @param top the number of projects in the top to fetch
 * @returns {BlueAsset[]} list of blue indicators (for the front end)
 */
export async function getTopBlueList(top = 100): Promise<BlueAsset[]> {
	const listings: CMCListing[] = await CoinMarketCap.getTopListings(top);

	const listingsInfo = await CoinMarketCap.getListingInfo(
		listings.map((l) => l.id)
	);

	const assets: BlueAsset[] = Object.values(listingsInfo).map((asset) => {
		return {
			id: asset.id,
			sourceCode: asset.urls.source_code?.[0],
			github: {
				activity: {deletions: 0, additions: 0, total: 0},
				repos: [],
				contributers: [],
			},
			indicators: {
				github: null,
			},
		} as BlueAsset;
	});


	return Promise.all(
		assets.map(async (asset) => {
			// todo: should we filter out those who don't have sourceCode?
			if (asset.sourceCode) {
				const urlParts = asset.sourceCode.replace('https://', '').split('/');
				let repos: GithubProjectResponse[];
				repos = await GitHub.getOrganisationRepositories(urlParts[1]);
				if (repos.length === 0)
					repos = await GitHub.getUserRepositories(urlParts[1]);

				// TODO(@VandeurenGlenn): isn't that super risky, too much data
				// @ts-ignore
				if (repos.length > 0) asset.github.repos = repos;

				let promises = [];

				for (const repo of repos) {
					// repo had activity within 7 days, so we try to get it's stats
					if (
						new Date(repo.pushed_at).getTime() + SEVEN_DAYS_AGO >=
						new Date().getTime()
					) {
						const [owner, name] = repo.full_name.split('/');
						promises.push(GitHub.getRepositoryCodeFrequency(owner, name));
					} else {
						// there was no activity, remove the repo to keep data to front minimal
						asset.github.repos.splice(repos.indexOf(repo));
					}
				}
				promises = await Promise.all(promises);
				asset.github.activity = promises.reduce(
					(previous, current) => {
						previous.additions += current.additions;
						previous.deletions += current.deletions;
						previous.total += current.additions + current.deletions;
						return previous;
					},
					{additions: 0, deletions: 0, total: 0}
				);
			}
			return asset;
		})
	);
}

/**
 *
 * @param top the number of projects in the top to fetch
 * @returns {CMCListing[]} list of indicators for
 */
export async function getTopListings(top = 100) {
	return await CoinMarketCap.getTopListings(top);
}
