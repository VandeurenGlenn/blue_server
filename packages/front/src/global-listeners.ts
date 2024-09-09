import {getThemeStore} from './imports.js';

window.onscroll = function () {
	let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

	// Show the button when scrolled 300px down
	if (scrollTop > 300) {
		window.app.goTopFab.classList.remove('hidden');
	} else {
		window.app.goTopFab.classList.add('hidden');
	}

	// Detect if the user is at the very top of the page
	if (scrollTop === 0) {
		window.app.topAppBar.removeAttribute('elevated');
	} else {
		window.app.topAppBar.setAttribute('elevated', null);
	}
};

window.addEventListener('keydown', async (e) => {
	if (e.altKey || e.ctrlKey) {
		return;
	}
	const target = e.composedPath()[0] as Element;
	if (['TEXTAREA', 'INPUT'].includes(target.tagName)) {
		return;
	}
	if (e.key === 'd') {
		(await getThemeStore()).toggleMode();
	}
});

export {};
