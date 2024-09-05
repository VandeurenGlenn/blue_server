import {type GithubProjectResponse} from '@blueserver/api/github';
import {MdItem} from '@material/web/labs/item/item.js';
import {withController} from '@snar/lit';
import {LitElement, css, html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {materialShellLoadingOff} from 'material-shell';
import {BlueAsset} from '../../../api/lib/DataBuilder.js';
import {ago} from '../ago.js';
import {SVG_GITHUB} from '../assets/assets.js';
import {SORTING_METHODS, SortingMethod, data} from '../data.js';
import '../price-change.js';
import styles from './app-shell.css?inline';

// @ts-ignore
MdItem.elementStyles.push(css`
.text {
flex: 0.5;
`);

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
			<header>
				<md-filled-text-field
					value="${data.search}"
					placeholder="search..."
					@input=${(e: Event) => {
						const target = e.target as HTMLInputElement;
						data.search = target.value;
					}}
				>
					<md-icon slot="leading-icon">search</md-icon>
				</md-filled-text-field>
				<div class="flex-1"></div>
				<md-filled-select
					value=${data.sortingMethod}
					@change=${(e: Event) => {
						const target = e.target as HTMLInputElement;
						data.sortingMethod = target.value as SortingMethod;
					}}
				>
					${SORTING_METHODS.map(
						(method) =>
							html`<md-select-option value=${method}
								>${method}</md-select-option
							>`,
					)}
				</md-filled-select>
			</header>

			${data.top100 ? this.#renderList() : html`loading....`}
		`;
	}

	#renderList() {
		let assets: BlueAsset[] = data.top100;
		if (data.search) {
			const query = data.search.toLowerCase();
			assets = assets.filter((asset) =>
				asset.name.toLowerCase().includes(query),
			);
		}
		switch (data.sortingMethod) {
			case 'pushed_at':
				assets = assets
					.filter((asset) => asset.github.repos.length)
					.sort((a, b) => {
						const aRepo = a.github.repos.find(
							(repo) => repo instanceof Object,
						) as Partial<GithubProjectResponse> | undefined;
						const bRepo = b.github.repos.find(
							(repo) => repo instanceof Object,
						) as Partial<GithubProjectResponse> | undefined;

						const aDate = aRepo?.pushed_at
							? new Date(aRepo.pushed_at)
							: new Date(0);
						const bDate = bRepo?.pushed_at
							? new Date(bRepo.pushed_at)
							: new Date(100);

						return bDate.getTime() - aDate.getTime();
					});
				break;
			case 'change 24h':
				assets = assets.sort((a, b) => {
					return b.change24h - a.change24h;
				});
				break;
			case 'alphabet':
				assets = assets.sort((a, b) => a.name.localeCompare(b.name));
				break;
		}

		if (assets.length === 0) {
			return html`<div style="text-align:center;margin:48px;">no results</div>`;
		}
		return html`
			<md-list class="p-0 gap-2">
				${repeat(
					assets,
					(asset) => asset.id,
					(asset) => {
						const repo = asset.github.repos.find(
							(r) => r instanceof Object,
						) as GithubProjectResponse;

						return html`
							<md-list-item
								@click=${() => {
									console.log(asset);
								}}
							>
								<md-icon-button
									slot="start"
									href="${asset.website}"
									target="_blank"
								>
									<img src=${asset.logo} />
								</md-icon-button>
								<div slot="overline" class="text-gray-300">#${asset.rank}</div>
								<div slot="headline">${asset.symbol}</div>
								<div slot="supporting-text">${asset.name}</div>
								<div
									slot="trailing-supporting-text"
									class="flex-1 flex items-center justify-between"
								>
									<price-change change=${asset.change24h}></price-change>
									${repo && repo.pushed_at
										? (() => {
												const _ago = ago(repo.pushed_at);
												return html`
													${['now', 'sec', 'min', 'ho'].some((m) =>
														_ago.includes(m),
													)
														? '🔥 '
														: null}${_ago}
												`;
											})()
										: null}
								</div>
								<md-icon-button
									slot="end"
									?disabled=${!repo}
									href="${repo?.url}"
									target="_blank"
								>
									<md-icon>${SVG_GITHUB}</md-icon>
								</md-icon-button>
							</md-list-item>
						`;
					},
				)}
			</md-list>
		`;
	}
}

export const app = (window.app = new AppShell());
