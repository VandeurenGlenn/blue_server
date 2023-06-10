import {GithubActivity, GithubProjectResponse} from '@blueserver/types';
import {env} from './envs.js';

const headers = new Headers();
headers.append('Authorization', `Bearer ${env.github}`);
headers.append('X-GitHub-Api-Version', `2022-11-28`);

export class GitHub {
	static getRepositoryCodeFrequency = async (
		owner: string,
		name: string
	): Promise<GithubActivity> => {
		const response = await fetch(
			`https://api.github.com/repos/${owner}/${name}/stats/code_frequency`,
			{headers}
		);

		const result: [number, number, number][] = (await response.json()) as [];
		if (result.length > 0) {
			const [total, additions, deletions] = result[0];
			return {total, additions, deletions};
		}
		return {additions: 0, deletions: 0, total: 0};
	};

	static async _getRepos(name: string, type: string): Promise<GithubProjectResponse[]> {
		const response = await fetch(`https://api.github.com/${type}/${name}/repos`, 
			{ headers }
		)
		if (response.status === 404) return [];
		return response.json();
	}

	static async getRepos(name: string) {
		let repos = await this._getRepos(name, 'orgs')
		if (repos.length === 0) await this._getRepos(name, 'users')
	}
}
