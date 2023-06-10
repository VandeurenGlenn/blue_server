import { BlueAsset } from '@blueserver/types';
export default class WSApiClient {
    #private;
    constructor();
    top100(): Promise<BlueAsset[]>;
    subscribe(event: string, cb: Function): any;
}
