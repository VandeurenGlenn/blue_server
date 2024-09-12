export async function getThemeStore() {
	const {themeStore} = await import('./styles/styles.js');
	return themeStore;
}

export async function getSettingsDialog() {
	const {settingsDialog} = await import('./settings/settings-dialog.js');
	return settingsDialog;
}

export async function getAssetInfoDialog(asset?: BlueAsset) {
	const {assetInfoDialog} = await import('./assetInfo/asset-info-dialog.js');
	return assetInfoDialog;
}
