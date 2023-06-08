export type BlueCache = {currencies: CMCCurrency[]};

export type githubReturn = {
	activity: number;
	repos: string[];
	contributers: string[];
};

export type CMCCurrency = {
	id: string;
	name: string;
	slug: string;
	logo: string;
	symbol: string;
	price: number;
	description: string;
	sourceCode: string;
	github: githubReturn;
};

export interface DotEnvKeys {
	coinmarketcap: string;
	github: string;
	port: number;
}
