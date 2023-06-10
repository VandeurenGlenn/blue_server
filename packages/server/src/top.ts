import {BlueAsset, CMCListing, GithubProjectResponse} from '@blueserver/types';
import {CoinMarketCap} from './coinmarketcap.js';
import {GitHub} from './github.js';
import {SEVEN_DAYS_AGO} from './constants.js';
import { writeFile } from 'fs/promises';
import { cache } from './cache.js';

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

	// Pre-mapping of CoinMarketCap information to a blue list
	const assets: BlueAsset[] = Object.values(listingsInfo).map((asset) => {
		const blueAsset: BlueAsset = {
			id: asset.id,
			website: asset.urls.website[0],
			// This error is just a demonstration that we don't have
			// other solution to force consistent types.
			// sourceCode: asset.urls.source_code[0],
			github: {
				activity: {deletions: 0, additions: 0, total: 0},
				repos: asset.urls.source_code.filter((source) =>
					source.includes('github')
				),
				contributers: [],
			},
			indicators: {
				github: null,
			},
		};
		return blueAsset;
	});

	// This part is responsible of filling in the blanks (mainly github informations for now)
	return Promise.all(
		assets.map(async (asset: BlueAsset) => {
			// A github repo was present in CMC data, we fetch informations
			if (asset.github.repos.length > 0) {
				const urlParts = asset.github.repos[0]
					.replace('https://', '')
					.split('/');

				let orgRepos = await GitHub.getOrganisationRepositories(urlParts[1]);
				if (orgRepos.length === 0) {
					orgRepos = await GitHub.getUserRepositories(urlParts[1]);
				}

				// Just to test
				await writeFile('./repos.json', JSON.stringify(cache.github.repos.cached))
				await writeFile('./tags.json', JSON.stringify(cache.github.repos.tags))
				

				// TODO(@VandeurenGlenn): isn't that super risky, too much data
				// @Vdegenne yeah, not ideal, just there till we only return what we really need, then all the rest can go out
				// @ts-ignore
				if (orgRepos.length > 0) asset.github.repos = orgRepos;

				let promises = [];

				for (const repo of orgRepos) {
					// repo had activity within 7 days, so we try to get it's stats
					if (
						new Date(repo.pushed_at).getTime() + SEVEN_DAYS_AGO >=
						new Date().getTime()
					) {
						const [owner, name] = repo.full_name.split('/');
						promises.push(GitHub.getRepositoryCodeFrequency(owner, name));
					} else {
						// there was no activity, remove the repo to keep data to front minimal
						asset.github.repos.splice(orgRepos.indexOf(repo));
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
