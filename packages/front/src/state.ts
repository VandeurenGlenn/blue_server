import {WSApiClient} from '@blueserver/api/client/ws';
import {ReactiveController, state as state} from '@snar/lit';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {inspect} from './ix-object-inspector.js';

export enum SortingMethod {
	Alphabet = 'Alphabet',
	Change24h = 'Change 24h',
	Github = 'GitHub',
}
export const sortingMethodsInfo: {
	method: SortingMethod;
	description: string;
}[] = [
	{method: SortingMethod.Alphabet, description: ''},
	{method: SortingMethod.Change24h, description: '24h price change'},
	{method: SortingMethod.Github, description: 'GitHub activity'},
];

declare global {
	interface Window {
		appstate: AppState;
	}
}

@saveToLocalStorage('blue-front:state')
class AppState extends ReactiveController {
	@state() top100: BlueAsset[] = undefined;
	@state() sortingMethod = SortingMethod.Alphabet;
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
				// inspect(this.top100.find((a) => a.name === 'Pepe'));
				this.requestUpdate();
			});
		});
	}
}

export const appstate = (window.appstate = new AppState());
