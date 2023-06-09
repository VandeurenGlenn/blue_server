import {LitElement, html} from 'lit';
import {state} from 'lit/decorators.js';
import {customElement} from 'define-custom-element-decorator';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/divider/divider.js';
import {fetchInformation} from './util.js';
import {loadTailwindBaseStyles, withTailwind} from 'vite-lit-with-tailwind';
import styles from './styles.css?inline';
import {updateEvery} from './globals.js';
import t from 'toastit';
import {placeFireImg, placeSnailImg} from './assets.js';

await loadTailwindBaseStyles('[hidden] { display: none }');

export interface Indicator {
	name: 'github' | 'twitter';
	information: any;
}
export interface Asset {
	name: string;
	indicator: Indicator;
}

@withTailwind(styles)
@customElement({inject: true})
class AppShell extends LitElement {
	@state() assets: Asset[] = [];

	render() {
		return html`
			<header style="font-weight:100;"><i>[bluecode]</header>
			<md-list>
				${this.assets.map((asset, i) => {
console.log(
this.assets.length, i
)
					return html`
						<md-list-item
							headline=${asset.name}
							supportingText="updated ${asset.indicator.information}"
						>
							<div slot="end">${asset.indicator.icon == 'fire' ? placeFireImg() : placeSnailImg()}</div>
						</md-list-item>
						<md-divider ?hidden=${i + 1 == this.assets.length}></md-divider>
					`;
				})}
			</md-list>
		`;
	}

	async _fetchInfo() {
		const info = await fetchInformation();
		const assets: Asset[] = [];
		for (const asset of Object.keys(info)) {
			assets.push({
				name: asset,
				indicator: {
					name: 'github',
					information: info[asset]['github'],
					icon: info[asset]['icon']
				},
			});
		}
		this.assets = assets;
	}

	protected firstUpdated() {
		setInterval(this._fetchInfo, updateEvery);
		this._fetchInfo();
	}
}

new AppShell();
