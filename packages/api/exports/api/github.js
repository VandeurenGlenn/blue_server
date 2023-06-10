import { cache } from '@blueserver/cache';
export class GitHub {
    #headers = new Headers();
    constructor(key) {
        this.#headers.append('Authorization', `Bearer ${key}`);
        this.#headers.append('X-GitHub-Api-Version', `2022-11-28`);
    }
    async getRepositoryCodeFrequency(owner, name) {
        const headers = this.#headers;
        // @ts-ignore
        headers.append('If-None-Match', cache.github.stats.tags[name]);
        const response = await fetch(`https://api.github.com/repos/${owner}/${name}/stats/code_frequency`, { headers: this.#headers });
        // @ts-ignore
        if (response.status === 304)
            return cache.github.stats.cached[name];
        // @ts-ignore
        cache.github.stats.tags[name] = response.headers.get('ETag');
        const result = (await response.json());
        // @ts-ignore
        cache.github.stats.cached[name] = { additions: 0, deletions: 0, total: 0 };
        if (result.length > 0) {
            const [total, additions, deletions] = result[0];
            // @ts-ignore
            cache.github.stats.cached[name] = { total, additions, deletions };
        }
        // @ts-ignore
        return cache.github.stats.cached[name];
    }
    async _getRepos(name, type) {
        const headers = this.#headers;
        // @ts-ignore
        headers.append('If-None-Match', cache.github.repos.tags[name]);
        const response = await fetch(`https://api.github.com/${type}/${name}/repos`, { headers });
        // @ts-ignore
        if (response.status === 304)
            return cache.github.repos.cached[name];
        // @ts-ignore
        cache.github.repos.tags[name] = response.headers.get('ETag');
        if (response.status === 404)
            return [];
        // @ts-ignore
        cache.github.repos.cached[name] = await response.json();
        // @ts-ignore
        return cache.github.repos.cached[name];
    }
    async getRepos(name) {
        let repos = await this._getRepos(name, 'orgs');
        if (repos.length === 0)
            await this._getRepos(name, 'users');
        return repos;
    }
}
//# sourceMappingURL=github.js.map