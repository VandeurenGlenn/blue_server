import {cache} from './../cache.js'
import fetch from 'node-fetch'

export class GitHub {
	#headers = new Headers()

	constructor(key: string, apiVersion = '2022-11-28') {
		this.#headers.append('Authorization', `Bearer ${key}`)
		this.#headers.append('X-GitHub-Api-Version', apiVersion)
	}

	async getRepositoryCodeFrequency(owner: string, name: string): Promise<GithubActivity> {
		const headers = this.#headers
		headers.set('If-None-Match', cache.github.stats.tags[name])
		const response = await fetch(`https://api.github.com/repos/${owner}/${name}/stats/code_frequency`, {
			headers: this.#headers
		})
		if (response.status === 304) {
			return cache.github.stats.cached[name]
		}
		cache.github.stats.tags[name] = response.headers.get('ETag') as string

		const result: [number, number, number][] = (await response.json()) as []
		cache.github.stats.cached[name] = {additions: 0, deletions: 0, total: 0}
		if (result.length > 0) {
			const [total, additions, deletions] = result[0]
			cache.github.stats.cached[name] = {total, additions, deletions}
		}
		return cache.github.stats.cached[name]
	}

	async #getRepos(name: string, type: string): Promise<GithubProjectResponse[]> {
		const headers = this.#headers
		if (cache.github.repos.tags[name]) headers.set('If-None-Match', cache.github.repos.tags[name])
		if (type === 'Organization') {
			type = 'orgs'
		}
		const response = await fetch(`https://api.github.com/${type}/${name}/repos`, {headers})
		if (response.status === 304) {
			return cache.github.repos.cached[name]
		}
		cache.github.repos.tags[name] = response.headers.get('ETag') as string
		if (response.status === 404) return []
		cache.github.repos.cached[name] = (await response.json()) as unknown as GithubProjectResponse[]
		return cache.github.repos.cached[name]
	}

	async getRepos(name: string) {
		let repos = await this.#getRepos(name, 'orgs')
		if (repos.length === 0) await this.#getRepos(name, 'users')
		return repos
	}
}
