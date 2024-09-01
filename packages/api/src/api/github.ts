import {GithubActivity} from '@blueserver/types';
import {cache} from './../cache.js';

export type GithubProjectResponse = {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	private: boolean;
	owner: {
		name: string;
		login: string;
		id: number;
		node_id: string;
		avatar: string;
		gravatar: string;
		url: string;
		html_url: string;
		followers_url: string;
		following_url: string;
		gists_url: string;
		starred_url: string;
		subscriptions_url: string;
		organizations_url: string;
		repos_url: string;
		events_url: string;
		received_events_url: string;
		type: string;
		site_admin: false;
	};
	html_url: string;
	description: string;
	fork: false;
	url: string;
	forks_url: string;
	keys_url: string;
	collaborators_url: string;
	teams_url: string;
	hooks_url: string;
	issue_events_url: string;
	events_url: string;
	assignees_url: string;
	branches_url: string;
	tags_url: string;
	blobs_url: string;
	git_tags_url: string;
	git_refs_url: string;
	trees_url: string;
	statuses_url: string;
	languages_url: string;
	stargazers_url: string;
	contributors_url: string;
	subscribers_url: string;
	subscription_url: string;
	commits_url: string;
	git_commits_url: string;
	comments_url: string;
	issue_comment_url: string;
	contents_url: string;
	compare_url: string;
	merges_url: string;
	archive_url: string;
	downloads_url: string;
	issues_url: string;
	pulls_url: string;
	milestones_url: string;
	notifications_url: string;
	labels_url: string;
	releases_url: string;
	deployments_url: string;
	created_at: string;
	updated_at: string;
	pushed_at: string;
	git_url: string;
	ssh_url: string;
	clone_url: string;
	svn_url: string;
	homepage: string | null;
	size: number;
	stargazers_count: number;
	watchers_count: number;
	language: string;
	has_issues: boolean;
	has_projects: boolean;
	has_downloads: boolean;
	has_wiki: boolean;
	has_pages: boolean;
	has_discussions: boolean;
	forks_count: number;
	mirror_url: string | null;
	archived: boolean;
	disabled: boolean;
	open_issues_count: number;
	license: {
		key: string;
		name: string;
		spdx_id: string;
		url: string;
		node_id: string;
	};
	allow_forking: boolean;
	is_template: boolean;
	web_commit_signoff_required: boolean;
	topics: [];
	visibility: number;
	forks: number;
	open_issues: number;
	watchers: number;
	default_branch: string;
	permissions: {
		admin: boolean;
		maintain: boolean;
		push: boolean;
		triage: boolean;
		pull: boolean;
	};
};

export declare type GithubProject = {
	activity: GithubActivity;
	repos: (Partial<GithubProjectResponse> | string)[];
	contributers: string[];
};

export class GitHub {
	#headers = new Headers();

	constructor(key: string, apiVersion = '2022-11-28') {
		this.#headers.append('Authorization', `Bearer ${key}`);
		this.#headers.append('X-GitHub-Api-Version', apiVersion);
	}

	async getRepositoryCodeFrequency(
		owner: string,
		name: string
	): Promise<GithubActivity> {
		const headers = this.#headers;
		headers.set('If-None-Match', cache.github.stats.tags[name]);
		const response = await fetch(
			`https://api.github.com/repos/${owner}/${name}/stats/code_frequency`,
			{headers: this.#headers}
		);
		if (response.status === 304) {
			return cache.github.stats.cached[name];
		}
		cache.github.stats.tags[name] = response.headers.get('ETag') as string;

		const result: [number, number, number][] = (await response.json()) as [];
		cache.github.stats.cached[name] = {additions: 0, deletions: 0, total: 0};
		if (result.length > 0) {
			const [total, additions, deletions] = result[0];
			cache.github.stats.cached[name] = {total, additions, deletions};
		}
		return cache.github.stats.cached[name];
	}

	async #getRepos(
		name: string,
		type: string
	): Promise<GithubProjectResponse[]> {
		const headers = this.#headers;
		headers.set('If-None-Match', cache.github.repos.tags[name]);
		if (type === 'Organization') {
			type = 'orgs';
		}
		const response = await fetch(
			`https://api.github.com/${type}/${name}/repos`,
			{headers}
		);
		if (response.status === 304) {
			return [];
		}
		cache.github.repos.tags[name] = response.headers.get('ETag') as string;
		if (response.status === 404) return [];
		cache.github.repos.cached[name] = await response.json();
		return cache.github.repos.cached[name];
	}

	async getRepos(name: string) {
		let repos = await this.#getRepos(name, 'orgs');
		if (repos.length === 0) await this.#getRepos(name, 'users');
		return repos;
	}
}
