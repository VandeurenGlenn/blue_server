import { GithubActivity, GithubProjectResponse } from '@blueserver/types';
export declare class GitHub {
    #private;
    constructor(key: string);
    getRepositoryCodeFrequency(owner: string, name: string): Promise<GithubActivity>;
    _getRepos(name: string, type: string): Promise<GithubProjectResponse[]>;
    getRepos(name: string): Promise<GithubProjectResponse[]>;
}
