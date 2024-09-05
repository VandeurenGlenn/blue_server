import {WSApiClient} from '@blueserver/api/client/ws';
import {ReactiveController, state} from '@snar/lit';
import {BlueAsset} from '../../api/lib/DataBuilder.js';

export const SORTING_METHODS = ['pushed_at', 'change 24h', 'alphabet'] as const;
export type SortingMethod = (typeof SORTING_METHODS)[number];

export class DataCtrl extends ReactiveController {
	@state() top100: BlueAsset[];
	@state() sortingMethod: SortingMethod = SORTING_METHODS[0];
	@state() search: string = '';

	constructor() {
		super();

		// Connnecting to the Websocket
		const ws = new WSApiClient();
		ws.clientReady.then((client) => {
			ws.subscribe('top100', (data) => {
				// Should print data in the console when the pubsub updates.
				console.log(data);
			});
			console.log(client.pubsub.subscribers); // that shows broken information
		});
	}
}

export const data = new DataCtrl();
