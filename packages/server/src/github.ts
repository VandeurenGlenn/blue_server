import {GithubActivity, GithubProjectResponse} from '@blueserver/types';
import {env} from './envs.js';

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
		const response = await fetch(`https://api.github.com/users/${name}/repos`, {
			headers: githubHeaders,
		});
		if (response.status === 404) return [];
		return response.json() as Promise<GithubProjectResponse[]>;
	};

	static getOrganisationRepositories = async (
		name: string
	): Promise<GithubProjectResponse[]> => {
		const response = await fetch(`https://api.github.com/orgs/${name}/repos`, {
			headers: githubHeaders,
		});
		if (response.status === 404) return [];
		return response.json() as Promise<GithubProjectResponse[]>;
	};
}
