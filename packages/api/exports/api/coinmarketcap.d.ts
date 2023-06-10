import { CMCAsset, CMCListing } from '@blueserver/types';
export declare class CoinMarketCap {
    #private;
    constructor(key: string);
    /** [{ "id": "1", ... }] */
    getLatestListings(top?: number): Promise<CMCListing[]>;
    /** { "1": { ... }} */
    getListingInfo(listingIds: string[] | string): Promise<{
        [listingId: number]: CMCAsset;
    }>;
}
