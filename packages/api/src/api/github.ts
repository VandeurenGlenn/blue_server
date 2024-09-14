import {env} from '@blueserver/env'
import fetch, {type Response} from 'node-fetch'
import {type CacheFileData, readCacheFile, writeCacheFile} from './../cache.js'
import {deepClone, filterObject} from '../utils.js'
import {Logger} from '../log.js'
import chalk from 'chalk'

const GITHUB_PROJECTS_FILENAME = 'github-projects.json'

export const availableRepoTypes: GitHubRepoType[] = ['orgs', 'users']

export function narrowGithubRepoResponseToGithubRepo(response: GithubRepoResponse): GitHubRepo {
	return filterObject(response, ['name', 'url', 'description', 'pushed_at'])
}

export class GitHubAPI {
	#headers = new Headers()
	#projects: CacheFileData<GithubProject[]> | undefined = undefined
	#logger = new Logger('api (github)', chalk.blue, false)

	constructor(key: string, apiVersion = '2022-11-28') {
		this.#headers.append('Authorization', `Bearer ${key}`)
		this.#headers.append('X-GitHub-Api-Version', apiVersion)

		this.#loadProjects()
	}

	#loadProjects() {
		try {
			this.#projects = readCacheFile(GITHUB_PROJECTS_FILENAME)
		} catch {
			this.#projects = {
				data: [],
				lastUpdated: Date.now()
			}
		}
	}
	#saveProjects() {
		if (this.#projects === undefined) {
			throw new Error("Couldn't save. No data to save.")
		}
		this.#projects.lastUpdated = Date.now()
		writeCacheFile(GITHUB_PROJECTS_FILENAME, this.#projects)
	}

	getProject(cmcAssetId: number) {
		if (this.#projects === undefined) {
			throw new Error('Projects cached data not available')
		}
		return this.#projects.data.find((project) => project.cmc_id === cmcAssetId)
	}
	projectExist(cmcAssetId: number) {
		return !!this.getProject(cmcAssetId)
	}
	#addProject({cmcAssetId, project, force = false}: {cmcAssetId: number; project: GithubProject; force?: boolean}) {
		this.#projects ??= {lastUpdated: Date.now(), data: []}
		const _project = this.getProject(cmcAssetId)
		if (_project === undefined) {
			this.#projects.data.push(project)
			this.#saveProjects()
		} else if (force) {
			Object.assign(_project, project)
			this.#saveProjects()
		}
	}

	#fetchReposPromise: Promise<GithubProject | undefined> | undefined
	get fetchReposComplete() {
		return this.#fetchReposPromise
	}

	/**
	 * @param cmcAssetId the id of the CMC asset to bind the repos with
	 */
	async #fetchRepos(name: string, type: GitHubRepoType, etag?: string): Promise<Response> {
		const headers = this.#headers

		if (etag) {
			headers.set('If-None-Match', etag)
		}

		return await fetch(`https://api.github.com/${type}/${name}/repos`, {headers})
	}

	/**
	 * Fetches repos for the name and returns updated project or undefined
	 * if fetch failed and no project were found locally.
	 * The returned project object is deep cloned so external code can manipulate them
	 * without worrying about altering the cache.
	 */
	// TODO: Though GitHub API responds fast we could make this function Promise.all and allow more than one name fetch at once
	async fetchRepos(
		name: string,
		cmcAssetId: number,
		options: {
			type?: GitHubRepoType
		} = {type: 'orgs'}
	) {
		if (cmcAssetId === undefined) {
			throw new Error('Need to provide CMC Id when fetching repos.')
		}
		let types: GitHubRepoType[] = ['orgs', 'users']
		if (options.type === 'users') {
			types.reverse() // try 'users' first
		}
		this.#fetchReposPromise = new Promise<GithubProject | undefined>(async (_resolve) => {
			function resolve(project: GithubProject | undefined) {
				_resolve(deepClone(project))
			}
			let project = this.getProject(cmcAssetId)
			let type: GitHubRepoType = 'orgs'
			let response!: Response
			for (const type of types) {
				this.#logger.log(`fetching ${chalk.bold(name)} repos (type: ${type.toUpperCase()})`)
				response = await this.#fetchRepos(name, type, project?.reposFetchEtag)
				if (response.status === 200) {
					break
				}
				if (response.status === 304) {
					resolve(project) // Unchanged we just return cache
					return
				}
				if (response.status === 404) {
					continue // Not found, trying next type
				}
			}

			// Ended on a bad note
			if (response.status === 404) {
				// Both request returned nothing, we just return project in cache
				// but it's more likely this will always be undefined;
				resolve(project)
				return
			}

			// At this point we have a valid response, we can update project object
			this.#addProject({
				cmcAssetId,
				project: {
					cmc_id: cmcAssetId,
					type,
					reposFetchEtag: response.headers.get('ETag')!,
					repos: (await response.json()) as GithubRepoResponse[]
				},
				force: true // force will force replacing if it already exists
			})

			resolve(project)
			return
		})

		return await this.#fetchReposPromise
	}

	// async getRepositoryCodeFrequency(owner: string, name: string): Promise<GithubActivity> {
	// 	const headers = this.#headers
	// 	headers.set('If-None-Match', cache.github.stats.tags[name])
	// 	const response = await fetch(`https://api.github.com/repos/${owner}/${name}/stats/code_frequency`, {
	// 		headers: this.#headers
	// 	})
	// 	if (response.status === 304) {
	// 		return cache.github.stats.cached[name]
	// 	}
	// 	cache.github.stats.tags[name] = response.headers.get('ETag') as string
	//
	// 	const result: [number, number, number][] = (await response.json()) as []
	// 	cache.github.stats.cached[name] = {additions: 0, deletions: 0, total: 0}
	// 	if (result.length > 0) {
	// 		const [total, additions, deletions] = result[0]
	// 		cache.github.stats.cached[name] = {total, additions, deletions}
	// 	}
	// 	return cache.github.stats.cached[name]
	// }
}

export const GitHub = new GitHubAPI(env.github)
