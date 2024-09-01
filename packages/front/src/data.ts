import {HttpApiClient} from '@blueserver/api/client/http';
import {ReactiveController, state} from '@snar/lit';
import {BlueAsset} from '../../api/lib/DataBuilder.js';

export const SORTING_METHODS = ['updated_at', 'alphabet'] as const;
export type SortingMethod = (typeof SORTING_METHODS)[number];

export class DataCtrl extends ReactiveController {
	@state() top100: BlueAsset[];
	@state() sortingMethod: SortingMethod = SORTING_METHODS[0];

	constructor() {
		super();
		HttpApiClient.top100().then((top100) => (this.top100 = top100));
	}
}

export const data = new DataCtrl();
