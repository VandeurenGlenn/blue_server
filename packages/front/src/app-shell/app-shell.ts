import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {withStyles} from 'lit-with-styles';
import styles from './app-shell.css?inline';
import {materialShellLoadingOff} from 'material-shell';

declare global {
	interface Window {
		app: AppShell;
	}
	interface HTMLElementTagNameMap {
		'app-shell': AppShell;
	}
}

@customElement('app-shell')
@withStyles(styles)
export class AppShell extends LitElement {
	firstUpdated() {
		materialShellLoadingOff.call(this);
	}

	render() {
		return html` <span class="font-bold bg-blue-200 text-orange-500">
			hello world
		</span>`;
	}
}

export const app = (window.app = new AppShell());
