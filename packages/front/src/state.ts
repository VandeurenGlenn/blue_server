import {WSApiClient} from '@blueserver/api/client/ws';
import {ReactiveController, state as state} from '@snar/lit';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {inspect} from './ix-object-inspector.js';

export const SORTING_METHODS = ['pushed at', 'change 24h', 'alphabet'] as const;
export type SortingMethod = (typeof SORTING_METHODS)[number];

declare global {
	interface Window {
		appstate: AppState;
	}
}

@saveToLocalStorage('blue-front:state')
class AppState extends ReactiveController {
	@state() top100: BlueAsset[] = [];
	@state() sortingMethod: SortingMethod = SORTING_METHODS[0];
	@state() search = '';

	constructor() {
		super();

		// Connnecting to the Websocket
		const ws = new WSApiClient();
		ws.clientReady.then(async () => {
			ws.subscribe('top100', (data) => {
				// TODO: Calculate the hash and do not update if there were no changes
				// since the last update
				this.top100 = data;
				this.requestUpdate();
			});
		});
	}
}

export const appstate = (window.appstate = new AppState());
