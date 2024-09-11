import '@material/mwc-top-app-bar';
import type {TopAppBar} from '@material/mwc-top-app-bar';
import type {MdFab, MdList} from '@material/web/all.js';
import {MdElevation} from '@material/web/elevation/elevation.js';
import {MdItem} from '@material/web/labs/item/item.js';
import {withController} from '@snar/lit';
import 'inspector-elements';
import {LitElement, css, html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement, query} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {unsafeSVG} from 'lit/directives/unsafe-svg.js';
import {materialShellLoadingOff} from 'material-shell';
import {bindInput} from 'relit';
import {SVG_GITHUB, SVG_LOGO} from '../assets/assets.js';
import '../date/date-element.js';
import {getSettingsDialog} from '../imports.js';
import '../price-change.js';
import '../select-chip.js';
import {appstate, SortingMethod} from '../state.js';
import {getCMCHref} from '../utils.js';
import styles from './app-shell.css?inline';

// @ts-ignore
MdItem.elementStyles.push(css`
:host([multiline]) .text {
flex: 1.2;
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
@withController(appstate)
export class AppShell extends LitElement {
	@query('mwc-top-app-bar') topAppBar!: TopAppBar;
	@query('md-fab#go-top-fab') goTopFab!: MdFab;
	@query('md-list') list!: MdList;

	async firstUpdated() {
		materialShellLoadingOff.call(this);
		appstate.bind(this);

		const elevation = new MdElevation();
		elevation.style.cssText =
			'opacity:0.5;transition:box-shadow 0.3s ease-in-out;';
		this.topAppBar.updateComplete.then(() => {
			this.topAppBar.renderRoot.querySelector('header').appendChild(elevation);
		});

		await this.list.updateComplete;
		this.list.items[0].tabIndex = -1;
	}

	render() {
		return html`
			<mwc-top-app-bar>
				<md-icon-button
					slot="navigationIcon"
					style="--md-icon-button-icon-size: 30px;"
				>
					<md-icon> ${unsafeSVG(SVG_LOGO)} </md-icon>
				</md-icon-button>

				<div slot="actionItems" class="flex gap-2">
					<md-outlined-text-field ${bindInput(appstate, 'search')}>
						<md-icon slot="leading-icon">search</md-icon>
						<div slot="trailing-icon" class="hidden"></div>
						${appstate.search
							? html`
									<md-icon-button
										slot="trailing-icon"
										@click=${() => (appstate.search = '')}
									>
										<md-icon>close</md-icon>
									</md-icon-button>
								`
							: null}
					</md-outlined-text-field>

					<md-icon-button
						@click=${async () => (await getSettingsDialog()).show()}
					>
						<md-icon>settings</md-icon>
					</md-icon-button>
				</div>

				<div id="content">${this.#renderContent()}</div>

				<md-fab
					id="go-top-fab"
					size="large"
					class="fixed bottom-8 right-8 hidden"
					@click=${() => {
						window.scrollTo({top: 0, behavior: 'smooth'});
					}}
				>
					<md-icon slot="icon">arrow_upward</md-icon>
				</md-fab>
			</mwc-top-app-bar>
		`;
	}

	#renderContent() {
		return html`
			<header>
				<md-filled-text-field
					value="${appstate.search}"
					placeholder="search..."
					@input=${(e: Event) => {
						const target = e.target as HTMLInputElement;
						appstate.search = target.value;
					}}
				>
					<md-icon slot="icon">search</md-icon>
				</md-filled-text-field>
				<div class="flex-1"></div>
				<select-chip></select-chip>
			</header>

			${appstate.top100
				? this.#renderList()
				: html`
						<div class="m-16 text-center">
							<md-circular-progress indeterminate></md-circular-progress>
						</div>
					`}
		`;
	}

	#renderList() {
		let assets: BlueAsset[] = appstate.top100;
		if (appstate.search) {
			const query = appstate.search.toLowerCase();
			assets = assets.filter((asset) =>
				asset.name.toLowerCase().includes(query),
			);
		}
		switch (appstate.sortingMethod) {
			case SortingMethod.Alphabet:
				assets = assets.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case SortingMethod.Change24h:
				assets = assets.sort((a, b) => {
					return b.change24h - a.change24h;
				});
				break;
			case SortingMethod.Github:
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
		}

		if (assets.length === 0) {
			return html`<div class="text-center m-16">
				No
				results${appstate.search
					? html` for <b>"${appstate.search}"</b>`
					: null}
			</div>`;
		}
		return html`
			<md-list class="p-0 gap-1">
				${repeat(
					assets,
					(asset) => asset.id,
					(asset) => this.#renderListItem(asset),
				)}
			</md-list>
		`;
	}

	#renderListItem(asset: BlueAsset) {
		const repo = asset.github.repos.find(
			(r) => r instanceof Object,
		) as GithubProjectResponse;

		return html`
			<md-list-item class="asset" type="button" @click=${() => {}}>
				<md-icon-button
					slot="start"
					href="${getCMCHref(asset.slug)}"
					target="_blank"
				>
					<img src=${asset.logo} />
				</md-icon-button>
				<div slot="overline">#${asset.rank}</div>
				<div slot="headline" title=${asset.name}>${asset.name}</div>
				<div slot="supporting-text">$${asset.symbol}</div>
				<div
					slot="trailing-supporting-text"
					class="flex-1 flex items-center justify-between"
				>
					<price-change change=${asset.change24h}></price-change>
				</div>

				<div slot="end" class="flex flex-col items-end">
					<md-icon-button
						?disabled=${!repo}
						href="${repo?.url}"
						target="_blank"
					>
						<md-icon>${SVG_GITHUB}</md-icon>
					</md-icon-button>
					${repo
						? html`<date-element date=${repo.pushed_at}></date-element>`
						: null}
				</div>
			</md-list-item>
		`;
	}

	activePreviousItem() {
		this.list.activatePreviousItem();
	}
	activeNextItem() {
		this.list.activateNextItem();
	}
}

export const app = (window.app = new AppShell());
