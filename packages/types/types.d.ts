export type BlueCache = {
	bluelist: BlueAsset[];
	github: {
		repos: {
			cached: {},
			tags: {}
		}, 
		stats: {
			cached: {},
			tags: {}
		}
	}
};

/**
 * Type of objects returned by CMC listings endpoint.
 */
export type CMCListing = {
	id: string;
	name: string;
	symbol: string;
	slug: string;
	num_market_pairs: number;
	date_added: string;
	tags: string[];
	max_supply: number;
	circulating_supply: number;
	total_supply: number;
	// type to define
	platform: any[];
	infinite_supply: boolean;
	cmc_rank: number;
	self_reported_circulating_supply: number | null;
	self_reported_market_cap: number | null;
	tvl_ratio: number | null;
	last_updated: string;
	// type to define
	quote: any[];
};

/**
 * Type of objects returned by CMC Currency information endpoint.
 */
export type CMCAsset = {
	id: number;
	name: string;
	symbol: string;
	category: string;
	description: string;
	slug: string;
	logo: string;
	subreddit: string;
	notice: string;
	tags: string[] | null;
	urls: {
		source_code: string[],
		website: string[],
		twitter: string[],
		chat: [],
		facebook: [],
		explorer: [],
		announcement: [],
		message_board: [],
		reddit: [],
		technical_doc: string[]
	};
	date_added: string;
	twitter_username: string | null;
	is_hidden: 0 | 1;
	date_launched: string;
	// type to define
	contract_address: any[];
	self_reported_circulating_supply: number | null;
	self_reported_tags: string[];
	self_reported_market_cap: number | null;
	infinite_supply: boolean;
	// price: number;
	// sourceCode: string;
	// github: GithubProject;
};

export declare type GithubProjectResponse = {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	private: boolean;
	owner: {
		login: string;
		id: number;
		node_id: string;
		avatar_url: string;
		gravatar_id: string;
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
	visibility: string;
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

export type GithubActivity = {
	additions: number;
	deletions: number;
	total: number;
};

export declare type GithubProject = {
	activity: GithubActivity;
	repos: string[];
	contributers: string[];
};

// TODO
export type GithubIndicator = {};

export type BlueAsset = {
	id: number;
	website: string|null;
	name: string,
	// sourceCode: string;
	github: GithubProject;
	indicators: {
		github: null;
	};
};

export interface DotEnvKeys {
	coinmarketcap: string;
	github: string;
	port: number;
}
