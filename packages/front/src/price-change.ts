import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {determineColor} from './temperatures.js';

@customElement('price-change')
export class PriceChange extends LitElement {
	@property({type: Number}) change!: number;

	static styles = css`
		:host {
			display: inline-block;
			transform: scale(0.8);
		}
	`;

	render() {
		const {background, foreground} = determineColor(this.change);
		const styles = styleMap({
			'--md-sys-color-surface-container-low': background,
			'--md-sys-color-on-surface': foreground,
		});
		return html`
			<md-assist-chip elevated style=${styles} inert
				>${this.change.toFixed(2)}%</md-assist-chip
			>
		`;
	}
}
