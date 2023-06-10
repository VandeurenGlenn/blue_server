
import {BlueAsset, CMCListing} from '@blueserver/types';
import {CoinMarketCap} from './coinmarketcap.js';
import {GitHub} from './github.js';

import {SEVEN_DAYS_AGO} from '@blueserver/server/constants';

export class ServerApi {
  coinMarketCap: CoinMarketCap;
  gitHub: GitHub;

  constructor(keys: {
      coinmarketcap: string,
      github: string
    }) {
    if (!keys) throw new Error('no api keys found (did you setup env?)')

    this.coinMarketCap = new CoinMarketCap(keys.coinmarketcap)
    this.gitHub = new GitHub(keys.github)
  }

  /**
   *
   * @param top the number of projects in the top to fetch
   * @returns {BlueAsset[]} list of blue indicators (for the front end)
   */
  async top100(limit = 100): Promise<BlueAsset[]>  {
    const listings: CMCListing[] = await this.coinMarketCap.getLatestListings(limit);

    const listingsInfo = await this.coinMarketCap.getListingInfo(
      listings.map((l) => l.id)
    )

    // This part is responsible of filling in the blanks (mainly github informations for now)
    return Promise.all(
      Object.values(listingsInfo).map(async (asset) => {
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
          }
        };
        // A github repo was present in CMC data, we fetch informations
        if (blueAsset.github.repos.length > 0) {
          const urlParts = blueAsset.github.repos[0]
            .replace('https://', '')
            .split('/');

          let repos = await this.gitHub.getRepos(urlParts[1]);
          // TODO(@VandeurenGlenn): isn't that super risky, too much data
          // @Vdegenne yeah, not ideal, just there till we only return what we really need, then all the rest can go out
          // @ts-ignore
          if (repos.length > 0) blueAsset.github.repos = repos.map(repo => ({
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            url: repo.html_url,
            description: repo.description,
            fork: repo.fork,
            pushed_at: repo.pushed_at,
            created_at: repo.created_at,
            size: repo.size,
            watchers: repo.watchers,
            forks: repo.forks,
            visibility: repo.forks,
            owner: {
              name: repo.owner.login,
              avatar: repo.owner.avatar_url,
              gravatar: repo.owner.gravatar_id,
              type: repo.owner.type
            }
          }));

          let promises = [];
          
          for (const repo of repos) {
            // repo had activity within 7 days, so we try to get it's stats
            if (
              new Date(repo.pushed_at).getTime() + SEVEN_DAYS_AGO >=
              new Date().getTime()
            ) {
              const [owner, name] = repo.full_name.split('/');
              promises.push(this.gitHub.getRepositoryCodeFrequency(owner, name));
            } else {
              // there was no activity, remove the repo to keep data to front minimal
              blueAsset.github.repos.splice(repos.indexOf(repo));
            }
          }
          promises = await Promise.all(promises);
          blueAsset.github.activity = promises.reduce(
            (previous, current) => {
              previous.additions += current.additions;
              previous.deletions += current.deletions;
              previous.total += current.additions + current.deletions;
              return previous;
            },
            {additions: 0, deletions: 0, total: 0}
          );
        }
        return blueAsset;
      })
    )}

  }
