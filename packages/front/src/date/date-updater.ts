import type {ReactiveElement, ReactiveController} from 'lit';

const instances: Set<ReactiveElement> = new Set();

setInterval(() => {
	for (const instance of instances) {
		instance.requestUpdate();
	}
}, 1000);

export class DateUpdater implements ReactiveController {
	#host: ReactiveElement;

	constructor(host: ReactiveElement) {
		(this.#host = host).addController(this);
	}

	hostConnected(): void {
		instances.add(this.#host);
	}

	hostDisconnected(): void {
		instances.delete(this.#host);
	}
}
