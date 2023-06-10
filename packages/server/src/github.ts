import {GithubActivity, GithubProjectResponse} from '@blueserver/types';
import {env} from './envs.js';
import { cache } from './cache.js';
import fetch from 'node-fetch'

const githubHeaders = new Headers();
githubHeaders.append('Authorization', `Bearer ${env.github}`);
githubHeaders.append('X-GitHub-Api-Version', `2022-11-28`);

export class GitHub {
	static getRepositoryCodeFrequency = async (
		owner: string,
		name: string
	): Promise<GithubActivity> => {
		const response = await fetch(
			`https://api.github.com/repos/${owner}/${name}/stats/code_frequency`,
			{headers: githubHeaders}
		);

		const result: [number, number, number][] = (await response.json()) as [];
		if (result.length > 0) {
			const [total, additions, deletions] = result[0];
			return {total, additions, deletions};
		}
		return {additions: 0, deletions: 0, total: 0};
	};

	static getUserRepositories = async (
		name: string
	): Promise<GithubProjectResponse[]> => {
		// @ts-ignore
		githubHeaders.append('If-None-Match', cache.github.repos.tags[name])

		const response = await fetch(`https://api.github.com/users/${name}/repos`, {
			headers: githubHeaders,
		});
		// @ts-ignore
		if (response.status === 304) return cache.github.repos.cached[name]
		// @ts-ignore
		cache.github.repos.tags[name] = response.headers.get('ETag')

		if (response.status === 404) return [];
		// @ts-ignore
		cache.github.repos.cached[name] = await response.json()
		// @ts-ignore
		return cache.github.repos.cached[name]
	};

	static getOrganisationRepositories = async (
		name: string
	): Promise<GithubProjectResponse[]> => {
		// @ts-ignore
		githubHeaders.append('If-None-Match', cache.github.repos.tags[name])
		const response = await fetch(`https://api.github.com/orgs/${name}/repos`, {
			headers: githubHeaders,
		});
		// @ts-ignore
		if (response.status === 304) return cache.github.repos.cached[name]
		// @ts-ignore
		cache.github.repos.tags[name] = response.headers.get('ETag')

		if (response.status === 404) return [];
		// @ts-ignore
		cache.github.repos.cached[name] = await response.json();
		// @ts-ignore
		return cache.github.repos.cached[name]
	
	};
}
