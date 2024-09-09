import '@material/web/chips/filter-chip.js';
import {type MdMenu} from '@material/web/menu/menu.js';
import {withController} from '@snar/lit';
import {LitElement, PropertyValues, css, html} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';
import {SORTING_METHODS, appstate} from './state.js';

// @ts-ignore
// MdFilterChip.elementStyles.push(css`
// 	.trailing.icon {
// 		display: flex;
// 		justify-content: center;
// 		align-items: center;
// 	}
// `);

@customElement('select-chip')
@withController(appstate)
export class SelectChip extends LitElement {
	@state() open = false;

	@query('md-menu') menu!: MdMenu;

	update(changed: PropertyValues<this>) {
		if (changed.has('open') && changed.get('open') !== undefined) {
			this.open ? this.menu.show() : this.menu.close();
		}

		super.update(changed);
	}

	render() {
		return html`
			<md-filter-chip
				elevated
				removable
				class="relative"
				@click=${(event: Event) => {
					event.preventDefault();
					this.open = !this.open;
				}}
				@remove=${(event: Event) => {
					event.preventDefault();
					const target = event.target as HTMLElement;
					target.click();
				}}
			>
				<md-icon slot="icon">sort</md-icon>
				${appstate.sortingMethod}
				<md-icon slot="remove-trailing-icon" style="--md-icon-size: 18px;"
					>arrow_drop_down</md-icon
				>
			</md-filter-chip>

			<md-menu
				quick
				@closed=${() => {
					this.open = false;
				}}
				.anchorElement=${this}
				?stay-open-on-outside-click=${false /* true for testing */}
				?stay-open-on-focusout=${false /* true for testing */}
			>
				${SORTING_METHODS.map(
					(method) => html`
						<md-menu-item
							@click=${() => {
								appstate.sortingMethod = method;
							}}
						>
							<div slot="headline">${method}</div>
						</md-menu-item>
					`,
				)}
			</md-menu>
		`;
	}

	static styles = css`
		:host {
			position: relative;
		}

		md-menu {
			min-width: 130px;
		}
	`;
}
