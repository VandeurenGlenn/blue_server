import {getTicker, newTicker} from './ticker.js'

class GitHubTicker {
	async ticker() {
		const DataBuilderTicker = await getTicker('DataBuilder')
		const dataBuilderInstance = DataBuilderTicker.instance
		await dataBuilderInstance.updateComplete // making sure databuilder is not working right now
		const githubdata = dataBuilderInstance.data.map((asset) => {
			GitHubFetch(asset.repo)
		})

		pubsub('github', githubdata)
	}
}

const githubTicker = new GitHubTicker()

newTicker()
