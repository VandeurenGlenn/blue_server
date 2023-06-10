import { BlueAsset } from '@blueserver/types';
import { CoinMarketCap } from './coinmarketcap.js';
import { GitHub } from './github.js';
export default class ServerApi {
    coinMarketCap: CoinMarketCap;
    gitHub: GitHub;
    constructor(keys: {
        coinmarketcap: string;
        github: string;
    });
    /**
     *
     * @param top the number of projects in the top to fetch
     * @returns {BlueAsset[]} list of blue indicators (for the front end)
     */
    top100(limit?: number): Promise<BlueAsset[]>;
}
