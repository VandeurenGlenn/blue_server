import chalk from 'chalk'
import {type PropertyValues, state} from 'snar'
import {PubSub} from '../pubsub.js'
import {cmcTicker} from './coinmarketcap.js'
import {Ticker} from './ticker.js'
import {availableRepoTypes, GitHub, narrowGithubRepoResponseToGithubRepo} from '../api/github.js'

class GithubTicker extends Ticker {
	@state() projects: GithubProject[] | undefined = undefined

	async tickerCall() {
		// if CMC ticker starts soon we ignore this call
		// since CMC ticker will automatically call it again
		if (cmcTicker.getTimeLeftRatio() < 0.1) {
			throw 0
		}

		// Make sure CMC ticker data is fully available
		await cmcTicker.runComplete

		this.setStart() // -- real run start

		if (!cmcTicker.blueAssets) {
			throw new Error("CMCTicker data couldn't be found, something went wrong.")
		}

		let projects: GithubProject[] = []
		cmcTicker.blueAssets.forEach(async (asset, i) => {
			const githubAddresses = asset.source_code.filter((source) => source.includes('github'))
			if (githubAddresses.length) {
				const [_domain, nameOrType, nameIfType] = githubAddresses[0].replace('https://', '').split('/')
				const name = !availableRepoTypes.includes(nameOrType as GitHubRepoType) ? nameOrType : nameIfType

				const project = await GitHub.fetchRepos(name, asset.id)
				if (project) {
					// Filter the data that only front needs
					project.repos.forEach((repo, i) => {
						project.repos[i] = narrowGithubRepoResponseToGithubRepo(repo as GithubRepoResponse)
					})
					projects.push(project)
				}
			}
		})

		this.projects = projects
		await this.updateComplete

		this.setEnd() // -- real run end
	}

	updated(changed: PropertyValues<this>) {
		if (changed.has('projects') && this.projects !== undefined) {
			this.logger.log('data available')
			PubSub.publish('github', this.projects)
		}
	}
}
export const githubTicker = new GithubTicker('ticker (github)', chalk.yellow)
