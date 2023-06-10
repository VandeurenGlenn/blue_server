import { BlueCache, BlueAsset } from '@blueserver/types';

export declare const cache: BlueCache;
export declare function init(): Promise<BlueAsset[]>;
export declare function updateCacheWithRemote(): Promise<BlueAsset[]>