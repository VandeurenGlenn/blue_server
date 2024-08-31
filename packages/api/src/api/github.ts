import {GithubActivity, GithubProjectResponse} from '@blueserver/types';
import {cache} from './../cache.js'
import fetch from 'node-fetch';

export class GitHub {
	#headers = new Headers()

	constructor(key: string) {
		this.#headers.append('Authorization', `Bearer ${key}`);
		this.#headers.append('X-GitHub-Api-Version', `2022-11-28`);
	}

	async getRepositoryCodeFrequency(
		owner: string,
		name: string
	): Promise<GithubActivity> {
		try {
			const headers = this.#headers
			// @ts-ignore
			headers.set('If-None-Match', cache.github.stats.tags[name])
			const response = await fetch(
				`https://api.github.com/repos/${owner}/${name}/stats/code_frequency`,
				{ headers: this.#headers }
			);
			
			// @ts-ignore
			if (response.status === 304) return cache.github.stats.cached[name]
			if (response.status === 404) return {additions: 0, deletions: 0, total: 0};
			// @ts-ignore
			cache.github.stats.tags[name] = response.headers.get('ETag')

			const result: [number, number, number][] = (await response.json()) as [];
			if (result.length > 0) {
				const [total, additions, deletions] = result[0];
				// @ts-ignore
				cache.github.stats.cached[name] = {total, additions, deletions}
			}
		} catch (error) {
			console.warn(error);
			// @ts-ignore
			cache.github.stats.cached[name] = {additions: 0, deletions: 0, total: 0}
		}
		// @ts-ignore
		return cache.github.stats.cached[name];
	}

	async _getRepos(name: string, type: string): Promise<GithubProjectResponse[]> {
		const headers = this.#headers
		// @ts-ignore
		headers.set('If-None-Match', cache.github.repos.tags[name])
		// @ts-ignore
		if (cache.github.repos.cached[name]?.owner?.type === 'Organization') type = 'orgs'
		const response = await fetch(`https://api.github.com/${type}/${name}/repos`, 
			{ headers }
		)
		// @ts-ignore
		if (response.status === 304) return cache.github.repos.cached[name]
		// @ts-ignore
		cache.github.repos.tags[name] = response.headers.get('ETag')
		if (response.status === 404) return [];
		// @ts-ignore
		cache.github.repos.cached[name] = await response.json()
		// @ts-ignore
		return cache.github.repos.cached[name]
	}

	async getRepos(name: string) {
		let repos = await this._getRepos(name, 'orgs')
		if (repos.length === 0) await this._getRepos(name, 'users')
		return repos
	}
}
