import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {withStyles} from 'lit-with-styles';
import styles from './app-shell.css?inline';
import {materialShellLoadingOff} from 'material-shell';
import {withController} from '@snar/lit';
import {data} from '../data.js';

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
@withController(data)
export class AppShell extends LitElement {
	firstUpdated() {
		materialShellLoadingOff.call(this);
	}

	render() {
		return html`
<md-list>
  ${data.top100.map((asset) => {
		return html` <md-list-item> </md-list-item> `;
	})}
  <md-list
</md-list>
`;
	}
}

export const app = (window.app = new AppShell());
