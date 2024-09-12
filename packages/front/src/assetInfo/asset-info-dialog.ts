import type {MdDialog} from '@material/web/all.js';
import {customElement} from 'custom-element-decorator';
import {LitElement, html, render} from 'lit';
import {withStyles} from 'lit-with-styles';
import {state, query} from 'lit/decorators.js';
import styles from './asset-info-dialog.css?inline';
import {sleep} from '../utils.js';

@customElement({name: 'asset-info-dialog', inject: true})
@withStyles(styles)
export class AssetInfoDialog extends LitElement {
	@state() open = false;
	@state() private asset: BlueAsset | undefined = undefined;
	script;
	@query('[slot=content]') dialogContentElement!: HTMLFormElement;

	@query('md-dialog') dialog!: MdDialog;
	@query('#tradingView') tradingViewContainer!: HTMLElement;

	render() {
		return html`
			<md-dialog
				?open=${this.open}
				@close=${() => (this.open = false)}
				style="
	max-width: calc(100vw - 28px);
	width: 100%;
	max-height: calc(100vh - 28px);
	height: 100%;
	/*--md-dialog-container-shape: 0;*/
"
			>
				${this.asset ? this.#renderDialogContent() : null}
			</md-dialog>
		`;
	}

	#renderDialogContent() {
		return html`
			<header slot="headline" class="gap-4">
				<md-icon><img src=${this.asset.logo} /></md-icon>
				${this.asset.name}
			</header>

			<form slot="content" method="dialog" id="form" style="height:100%">
				<div id="tradingView" style="height:100%"></div>
			</form>

			<div slot="actions" style="justify-content:space-between">
				<md-outlined-button href=${this.asset.website} target="_blank">
					<md-icon slot="icon">globe</md-icon>
					${this.asset.website}
				</md-outlined-button>
				<div slot="actions"></div>
				<md-text-button form="form">Close</md-text-button>
			</div>
		`;
	}

	createRenderRoot() {
		return this;
	}

	async show(asset?: BlueAsset) {
		if (asset) {
			this.asset = asset;
		}
		this.open = true;

		await this.updateComplete;
		if (asset) {
			this.script = document.createElement('script');
			this.script.type = 'text/javascript';
			this.script.async = true;
			this.script.src =
				'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
			this.script.innerHTML = JSON.stringify({
				autosize: true,
				symbol: `${asset.exchanges[0].toUpperCase()}:${asset.symbol}USDT`,
				interval: 'D',
				timezone: 'Etc/UTC',
				theme: 'dark',
				style: '1',
				locale: 'en',
				allow_symbol_change: true,
				calendar: false,
				support_host: 'https://www.tradingview.com',
			});
			// const dialog = this.renderRoot.querySelector<HTMLElement>('md-dialog');
			// await this.dialog.updateComplete;
			render(this.script, this.tradingViewContainer);
		}
	}

	close(returnValue?: string) {
		return this.dialog.close(returnValue);
	}
}

declare global {
	interface Window {
		assetInfoDialog: AssetInfoDialog;
	}
	interface HTMLElementTagNameMap {
		'asset-info-dialog': AssetInfoDialog;
	}
}

export const assetInfoDialog = (window.assetInfoDialog = new AssetInfoDialog());
