import {LitElement, css, html} from 'lit';
import {state} from 'lit/decorators.js';
import {customElement} from 'custom-element-decorator';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/divider/divider.js';
import {getBlueList, getCmcLogoSrcUrl} from './util.js';
import {loadTailwindBaseStyles} from 'vite-lit-with-tailwind';
import {updateEvery} from './globals.js';
import type {BlueAsset} from '@blueserver/types';
import {withStyles} from 'lit-with-styles';
import appStyles from './styles.css?inline';
import HttpApiClient from '@blueserver/api/clients/http';

await loadTailwindBaseStyles('[hidden] { display: none }');

@customElement({inject: true})
@withStyles([
	appStyles,
	css`
		md-list {
			display: block;
			margin: 24px;
		}
	`,
])
class AppShell extends LitElement {
	@state() assets: BlueAsset[] = [];

	// allows for easy switching between protocols
	client: HttpApiClient = new HttpApiClient()

	render() {
		return html`
			<header style="font-weight:100;">${'<blueserver>'}</header>
			<md-list>
				${this.assets.map((asset, i) => {
					return html`
						<md-list-item
							headline=${asset.name!}
							@click=${() => {
								window.open(asset.sourceCode, '_blank');
							}}
						>
							<div slot="start">
								<img src="${getCmcLogoSrcUrl(asset.id!)}" width="24" />
							</div>
							<div slot="end">${asset.github.activity.total}</div>
						</md-list-item>
						<md-divider
							?hidden=${i + 1 == this.assets.length}
							inset
						></md-divider>
					`;
				})}
			</md-list>
		`;
	}

	async _fetchInfo() {
		this.assets = await this.client.top100();
	}

	protected firstUpdated() {
		// When ws is finished setinterval can go away
		setInterval(this._fetchInfo, updateEvery);
		this._fetchInfo();
	}
}

new AppShell();
