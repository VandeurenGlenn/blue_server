import dotenv from 'dotenv';
import Koa from 'koa';
import cors from 'koa-cors';
import Router from 'koa-router';
import type {
	DotEnvKeys,
	BlueCache,
	GithubProjectResponse,
	CMCCurrency,
} from '@blueserver/types';
import pathlib from 'path';
import {CronJob} from 'cron';
import {fileURLToPath} from 'url';
import fetch from 'node-fetch';
import {readFile, writeFile} from 'fs/promises';

const __dirname = pathlib.dirname(fileURLToPath(import.meta.url));

const env = dotenv.config({
	path: pathlib.join(__dirname, '..', '.env.vault'),
}).parsed as DotEnvKeys | undefined;
// Required to exit the program nicely
// and remove undefined errors further in the code.
if (env === undefined) {
	console.log('env vars not found');
	process.exit(0);
}
const router = new Router();
// 7 days in ms
const sevenDaysAgo = 604_800_000;

// let lastUpdated: EpochTimeStamp;

const fetchGithub = (url: string) => {
	const headers = new Headers();
	headers.append('Authorization', `Bearer ${env.github}`);
	headers.append('X-GitHub-Api-Version', `2022-11-28`);
	return fetch(url, {headers});
};

const fetchCoinmarketcap = async (url: string) => {
	const headers = new Headers();
	headers.append('X-CMC_PRO_API_KEY', env.coinmarketcap);
	return await fetch(url, {headers});
};

const getCodeFrequency = async (owner: string, name: string) => {
	const response = await fetchGithub(
		`https://api.github.com/repos/${owner}/${name}/stats/code_frequency`
	);
	if (response.status === 404) return [];

	const result: [number, number, number][] = (await response.json()) as [];
	if (result.length > 0) {
		const [aggregate, additions, deletions] = result[0];
		return {aggregate, additions, deletions};
	}
	return {};
};

const getRepos = async (name: string): Promise<GithubProjectResponse[]> => {
	const response = await fetchGithub(
		`https://api.github.com/users/${name}/repos`
	);
	if (response.status === 404) return [];
	return response.json() as Promise<GithubProjectResponse[]>;
};

const getOrgRepos = async (name: string): Promise<GithubProjectResponse[]> => {
	const response = await fetchGithub(
		`https://api.github.com/orgs/${name}/repos`
	);
	if (response.status === 404) return [];
	return response.json() as Promise<GithubProjectResponse[]>;
};

const getCurrencyInfo = async (ids: string[] | string) => {
	if (!Array.isArray(ids)) ids = [ids];
	const response = await fetchCoinmarketcap(
		`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${ids.join(
			','
		)}`
	);
	// TODO: check if CMC has typescript types so we can easily understand returned data.
	// @ts-ignore
	return (await response.json()).data;
};

const getTop100 = async (): Promise<CMCCurrency[]> => {
	let currencies: CMCCurrency[];
	const response = await fetchCoinmarketcap(
		'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100'
	);

	currencies = ((await response.json()) as unknown as {data: CMCCurrency[]})
		.data as CMCCurrency[];

	const slugs = [];
	const ids = [];

	// console.log(currencies);
	for (const currency of currencies) {
		slugs.push(currency.slug);
		ids.push(currency.id);
	}

	const metadata = await getCurrencyInfo(ids);
	const list: CMCCurrency[] = [];
	for (let i = 1; i <= currencies.length; i++) {
		const id = currencies[i - 1].id;
		const sourceCode = metadata[id].urls.source_code?.[0];
		list[i - 1] = {
			id: metadata[id].id,
			name: metadata[id].name,
			slug: metadata[id].slug,
			logo: metadata[id].logo,
			symbol: metadata[id].symbol,
			price: currencies[i - 1].price,
			description: metadata[id].description,
			sourceCode,
			github: {
				activity: {},
				repos: [],
				contributers: [],
			},
		};
	}

	return Promise.all(
		list.map(async (item) => {
			// todo: should we filter out those who don't have sourceCode?
			if (item.sourceCode) {
				const urlParts = item.sourceCode.replace('https://', '').split('/');
				let repos: GithubProjectResponse[];
				repos = await getOrgRepos(urlParts[1]);
				if (repos.length === 0) repos = await getRepos(urlParts[1]);
				// @ts-ignore
				if (repos.length > 0) item.github.repos = repos;

				let promises = [];

				for (const repo of repos) {
					// repo had activity within 7 days, so we try to get it's stats
					if (
						new Date(repo.pushed_at).getTime() + sevenDaysAgo >=
						new Date().getTime()
					) {
						const [owner, name] = repo.full_name.split('/');
						promises.push(getCodeFrequency(owner, name));
					} else {
						// there was no activity, remove the repo to keep data to front minimal
						item.github.repos.splice(repos.indexOf(repo));
					}
				}
				promises = await Promise.all(promises);
				item.github.activity = promises.reduce(
					(previous: any, current: any) => {
						previous.additions += current.additions;
						previous.deletions += current.deletions;
						previous.total += current.additions + current.deletions;
						return previous;
					},
					{additions: 0, deletions: 0, total: 0}
				);
			}
			return item;
		})
	);
};

const dataFilename = 'data.json';
const cache: BlueCache = {
	currencies: [],
};
/**
 * Convenient function to load data (local or remote).
 * It saves data locally when fetched remotely.
 * The reason of this function is to get local data on start,
 *
 * so during dev, when files change it reloads the server multiple times
 * avoid remote fetch to avoid suspicious activity.
 */
async function loadCurrencies({local = false} = {}) {
	if (local) {
		// Get data from local
		try {
			cache.currencies = JSON.parse(
				(await readFile(pathlib.join(__dirname, '..', dataFilename))) + ''
			);
		} catch (_) {
			// default
			cache.currencies = [];
		}
	} else {
		// Get data from remote
		cache.currencies = await getTop100();
		writeFile(
			pathlib.join(__dirname, '..', dataFilename),
			JSON.stringify(cache.currencies)
		);
	}
}
loadCurrencies({local: true});

// fetch remotely every minute
new CronJob('* * * * *', loadCurrencies);

router.get(
	'/top-100',
	async (ctx) => (ctx.body = JSON.stringify(cache.currencies))
);

const server = new Koa();

server.use(cors({origin: '*'}));
server.use(router.routes()).use(router.allowedMethods());

server.listen(env.port);