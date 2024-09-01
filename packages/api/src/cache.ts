import {type GithubActivity} from '@blueserver/types'
import {readFile, writeFile} from 'fs/promises'
import {type GithubProjectResponse} from './api/github.js'
import {dataBuilder, type BlueAsset} from './DataBuilder.js'
import {LIST_SIZE as DEFAULT_LIST_SIZE, LOCAL_DATA_FILENAME} from './constants.js'

export type BlueCache = {
  bluelist: BlueAsset[]
  github: {
    repos: {
      cached: {
        [name: string]: GithubProjectResponse[]
      }
      tags: {[name: string]: string}
    }
    stats: {
      cached: {[name: string]: GithubActivity}
      tags: {[name: string]: string}
    }
  }
}

export const cache: BlueCache = {
  bluelist: [],
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
}

export const init = async () => {
  try {
    cache.bluelist = JSON.parse((await readFile(LOCAL_DATA_FILENAME)).toString())
    cache.github.repos.cached = JSON.parse((await readFile('./repos.json')).toString())
    cache.github.repos.tags = JSON.parse((await readFile('./tags.json')).toString())
    cache.github.stats.cached = JSON.parse((await readFile('./stats.json')).toString())
    cache.github.stats.tags = JSON.parse((await readFile('./statTags.json')).toString())
  } catch (error) {
    return []
  }
  return cache.bluelist
}

export async function updateCacheWithRemote() {
  cache.bluelist = await dataBuilder.createAssetList(DEFAULT_LIST_SIZE)
  writeFile(LOCAL_DATA_FILENAME, JSON.stringify(cache.bluelist))

  // Just to test
  await writeFile('./repos.json', JSON.stringify(cache.github.repos.cached))
  await writeFile('./tags.json', JSON.stringify(cache.github.repos.tags))
  await writeFile('./stats.json', JSON.stringify(cache.github.stats.cached))
  await writeFile('./statTags.json', JSON.stringify(cache.github.stats.tags))

  return cache.bluelist
}
