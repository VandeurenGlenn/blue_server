export declare type BlueCache = {currencies: {}[]};

export declare type githubReturn = {
	activity: number;
	repos: string[];
	contributers: string[];
};

export declare type CMCCurrency = {
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
