import {HttpApiClient} from '@blueserver/api/client/http';
import {ReactiveController, state} from '@snar/lit';
import {BlueAsset} from '../../api/lib/DataBuilder.js';

export class DataCtrl extends ReactiveController {
	@state() top100: BlueAsset[];

	constructor() {
		super();
		HttpApiClient.top100().then((top100) => (this.top100 = top100));
	}
}

export const data = new DataCtrl();
