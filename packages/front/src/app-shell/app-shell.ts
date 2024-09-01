import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {withStyles} from 'lit-with-styles';
import styles from './app-shell.css?inline';
import {materialShellLoadingOff} from 'material-shell';
import {withController} from '@snar/lit';
import {SORTING_METHODS, SortingMethod, data} from '../data.js';
import {BlueAsset} from '../../../api/lib/DataBuilder.js';
import {type GithubProjectResponse} from '@blueserver/api/github';
import {SVG_GITHUB} from '../assets/assets.js';

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
		let assets: BlueAsset[];
		switch (data.sortingMethod) {
			case 'updated_at':
				assets = data.top100.sort((a, b) => {
					const aRepo = a.github.repos.find(
						(repo) => repo instanceof Object,
					) as Partial<GithubProjectResponse> | undefined;
					const bRepo = b.github.repos.find(
						(repo) => repo instanceof Object,
					) as Partial<GithubProjectResponse> | undefined;

					const aDate = aRepo?.updated_at
						? new Date(aRepo.updated_at)
						: new Date(0);
					const bDate = bRepo?.updated_at
						? new Date(bRepo.updated_at)
						: new Date(100);

					return aDate.getTime() - bDate.getTime();
				});
				break;
			case 'alphabet':
				assets = data.top100.sort((a, b) => a.name.localeCompare(b.name));
				break;
		}
		return html`
			<md-list>
				${repeat(
					assets,
					(asset) => asset.id,
					(asset) => {
						const githubRepo = asset.github.repos.find(
							(r) => r instanceof Object,
						) as GithubProjectResponse;

						return html`
							<md-list-item
								@click=${() => {
									console.log(asset, githubRepo);
								}}
							>
								${githubRepo && githubRepo.updated_at
									? html` <div slot="supporting-text">${'test'}</div> `
									: null}
								<span>${asset.name}</span>
								<md-icon-button slot="end" ?disabled=${!githubRepo}>
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
