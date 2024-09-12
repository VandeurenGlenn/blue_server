import gamectrl, {XBoxButton} from 'esm-gamecontroller.js';
import {app} from './app-shell/app-shell.js';

const REPEATER_TIMEOUT = 200;
const REPEATER_SPEED = 100;

let upKeyRepeaterTimeout: number;
let upKeyRepeaterInterval: number;
let downKeyRepeaterTimeout: number;
let downKeyRepeaterInterval: number;

window.addEventListener('blur', () => {
	clearTimeout(upKeyRepeaterTimeout);
	clearInterval(upKeyRepeaterInterval);
	clearTimeout(downKeyRepeaterTimeout);
	clearInterval(downKeyRepeaterInterval);
});

gamectrl.on('connect', async (gamepad) => {
	function noTrigger() {
		return !gamepad.pressed.button6 && !gamepad.pressed.button7;
	}

	app.listItemsAreButtons = true;
	await app.updateComplete;

	gamepad.axeThreshold = [0.4];

	gamepad.before(XBoxButton.UP, () => {
		if (!noTrigger()) {
			return;
		}
		upKeyRepeaterTimeout = setTimeout(() => {
			upKeyRepeaterInterval = setInterval(() => {
				app.activePreviousItem();
			}, REPEATER_SPEED);
			// app.activePreviousItem();
		}, REPEATER_TIMEOUT);
		app.activePreviousItem();
	});
	gamepad.after(XBoxButton.UP, () => {
		clearTimeout(upKeyRepeaterTimeout);
		clearInterval(upKeyRepeaterInterval);
	});
	gamepad.before(XBoxButton.DPAD_UP, () => {
		if (!noTrigger()) {
			return;
		}
		upKeyRepeaterTimeout = setTimeout(() => {
			upKeyRepeaterInterval = setInterval(() => {
				app.activePreviousItem();
			}, REPEATER_SPEED);
			// app.activePreviousItem();
		}, REPEATER_TIMEOUT);
		app.activePreviousItem();
	});
	gamepad.after(XBoxButton.DPAD_UP, () => {
		clearTimeout(upKeyRepeaterTimeout);
		clearInterval(upKeyRepeaterInterval);
	});

	gamepad.before(XBoxButton.LEFT_STICK_DOWN, () => {
		if (!noTrigger()) {
			return;
		}
		downKeyRepeaterTimeout = setTimeout(() => {
			downKeyRepeaterInterval = setInterval(() => {
				app.activeNextItem();
			}, REPEATER_SPEED);
			// app.activeNextItem();
		}, REPEATER_TIMEOUT);
		app.activeNextItem();
	});
	gamepad.after(XBoxButton.LEFT_STICK_DOWN, () => {
		clearTimeout(downKeyRepeaterTimeout);
		clearInterval(downKeyRepeaterInterval);
	});
	gamepad.before(XBoxButton.DPAD_DOWN, () => {
		if (!noTrigger()) {
			return;
		}
		downKeyRepeaterTimeout = setTimeout(() => {
			downKeyRepeaterInterval = setInterval(() => {
				app.activeNextItem();
			}, REPEATER_SPEED);
			// app.activeNextItem();
		}, REPEATER_TIMEOUT);
		app.activeNextItem();
	});
	gamepad.after(XBoxButton.DPAD_DOWN, () => {
		clearTimeout(downKeyRepeaterTimeout);
		clearInterval(downKeyRepeaterInterval);
	});

	gamepad.before(XBoxButton.B, () => {
		if (noTrigger()) {
			const item = app.list.items.find((i) => i.tabIndex === 0);
			const buttonStart = item.querySelector<HTMLElement>('[slot=start]');
			// @ts-ignore
			buttonStart?.renderRoot.querySelector<HTMLElement>('#link')?.click();
		}
	});
});
