import {LitElement, css, html} from 'lit';
import {state} from 'lit/decorators.js';
import {customElement} from 'custom-element-decorator';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/divider/divider.js';
import {getBlueList, getCmcLogoSrcUrl} from './util.js';
import {loadTailwindBaseStyles} from 'vite-lit-with-tailwind';
import {updateEvery} from './globals.js';
import type {BlueIndicator} from '@blueserver/types';
import {withStyles} from 'lit-with-styles';
import appStyles from './styles.css?inline';

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
	@state() assets: BlueIndicator[] = [];

	render() {
		return html`
			<header style="font-weight:100;">${'<blueserver>'}</header>
			<md-list>
				${this.assets.map((asset, i) => {
					return html`
						<md-list-item headline=${asset.name!} @click=${() => {}}>
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
		this.assets = await getBlueList();
		const assets: BlueIndicator[] = [];
		return;
		// for (const asset of Object.keys(info)) {
		// 	assets.push({
		// 		name: asset,
		// 		indicator: {
		// 			name: 'github',
		// 			information: info[asset]['github'],
		// 			icon: info[asset]['icon'],
		// 		},
		// 	});
		// }
		// this.assets = assets;
	}

	protected firstUpdated() {
		setInterval(this._fetchInfo, updateEvery);
		this._fetchInfo();
	}
}

new AppShell();
