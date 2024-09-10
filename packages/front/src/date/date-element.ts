import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {DateUpdater} from './date-updater.js';
import {ago} from '../ago.js';
import {GIF_FIRE} from '../assets/assets.js';
import styles from './date-element.css?inline';

@customElement('date-element')
export class DateElement extends LitElement {
	@property() date = '';

	#updater = new DateUpdater(this);

	render() {
		const _ago = ago(this.date);
		return html`
			${['now', 'sec', 'min', 'ho'].some((m) => _ago.includes(m))
				? html`<img width="18" src=${GIF_FIRE} />`
				: /*? html`🔥 `*/
					null}${_ago}
		`;
	}

	static styles = [unsafeCSS(styles)];
}
