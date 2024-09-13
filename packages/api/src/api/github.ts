import fetch, {type Response} from 'node-fetch'
import {type CacheFileData, readCacheFile, writeCacheFile} from './../cache.js'

const GITHUB_PROJECTS_FILENAME = 'github-projects.json'

export class GitHub {
	#headers = new Headers()
	#projects: CacheFileData<GithubProject[]> | undefined = undefined

	constructor(key: string, apiVersion = '2022-11-28') {
		this.#headers.append('Authorization', `Bearer ${key}`)
		this.#headers.append('X-GitHub-Api-Version', apiVersion)

		this.#loadProjects()
	}

	#loadProjects() {
		this.#projects = readCacheFile(GITHUB_PROJECTS_FILENAME)
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

		if (type === 'Organization') {
			type = 'orgs'
		}

		return await fetch(`https://api.github.com/${type}/${name}/repos`, {headers})
	}

	async fetchRepos(name: string, cmcAssetId: number) {
		if (cmcAssetId === undefined) {
			throw new Error('Need to provide CMC Id when fetching repos.')
		}
		this.#fetchReposPromise = new Promise<GithubProject | undefined>(async (resolve) => {
			let project = this.getProject(cmcAssetId)
			let type: GitHubRepoType = 'orgs'
			let response = await this.#fetchRepos(name, type, project?.reposFetchEtag)
			if (response.status === 304) {
				// Unchanged we just return cache
				resolve(project)
				return
			}
			if (response.status === 404) {
				response = await this.#fetchRepos(name, type, project?.reposFetchEtag)
			}
			if (response.status === 304) {
				// Unchanged we just return cache
				resolve(project)
				return
			}
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
