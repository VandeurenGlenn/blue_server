import type {MdDialog} from '@material/web/all.js';
import {customElement} from 'custom-element-decorator';
import {LitElement, html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {state, query} from 'lit/decorators.js';
import styles from './asset-info-dialog.css?inline';

@customElement({name: 'asset-info-dialog', inject: true})
@withStyles(styles)
export class AssetInfoDialog extends LitElement {
	@state() open = false;
	@state() private asset: BlueAsset | undefined = undefined;

	@query('md-dialog') dialog!: MdDialog;

	render() {
		return html`
			<md-dialog ?open=${this.open} @close=${() => (this.open = false)}>
				${this.asset ? this.#renderDialogContent() : null}

				<div slot="actions">
					<md-text-button form="form">Close</md-text-button>
				</div>
			</md-dialog>
		`;
	}

	#renderDialogContent() {
		return html`
			<header slot="headline" class="gap-4">
				<md-icon><img src=${this.asset.logo} /></md-icon>
				${this.asset.name}
			</header>

			<form slot="content" method="dialog" id="form">Coming soon</form>
		`;
	}

	async show(asset?: BlueAsset) {
		if (asset) {
			this.asset = asset;
		}
		this.open = true;
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
