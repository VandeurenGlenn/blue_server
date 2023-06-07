import dotenv from 'dotenv'
import Koa from 'koa'
import cors from 'koa-cors'
import Router from 'koa-router'
import { blueCache, top100Return } from './types.js'
import { CronJob } from 'cron'

const keys = dotenv.config().parsed
const router = new Router()
const oneHour = 3600_000
const jobs = []

const cache: blueCache = {
  currencies: []
}

let lastUpdated: EpochTimeStamp

const shouldUpdate = ( ) => lastUpdated + oneHour <= new Date().getTime()

const fetchGithub = () => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${keys.github}`);
  headers.append("X-GitHub-Api-Version", `2022-11-28`)
}

const fetchCoinmarketcap = (url) => {
  const headers = new Headers();
  headers.append("X-CMC_PRO_API_KEY", keys.coinmarketcap);
  return fetch(url, { headers })
}

const getCurrencyInfo = async (ids: string[] | string) => {
  if (!Array.isArray(ids)) ids = [ids]
  const response = await fetchCoinmarketcap(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${ids.join(',')}`)
  return (await response.json()).data
}

const getTop100 = async (): Promise<top100Return[]> => {
  let currencies
  let response = await fetchCoinmarketcap('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100')
  currencies = (await response.json()).data
  
  const slugs = []
  const ids = []

  for (const currency of currencies) {
    slugs.push(currency.slug)
    ids.push(currency.id)
  }

  const metadata = await getCurrencyInfo(ids)
  const list: top100Return[] = []
  for (let i = 1; i <= currencies.length; i++) {
    const id = currencies[i - 1].id
    const sourceCode = metadata[id].urls.source_code?.[0]
    list[(i - 1)] = {
      id: metadata[id].id,
      name: metadata[id].name,
      slug: metadata[id].slug,
      logo: metadata[id].logo,
      symbol: metadata[id].symbol,
      price: currencies[i - 1].price,
      description: metadata[id].description,
      sourceCode,
      github: {
        activity: 0,
        repos: []
      }
    }
  }

  return Promise.all(list.map(async (item) => {
    // todo: should we filter out those who don't have sourceCode?
    if (item.sourceCode) {
      let url

      const urlParts = item.sourceCode.replace('https://', '').split('/')

      // check if a link is a profile
      // note: a profile could also be an organization
      const isProfile = item.sourceCode.split('/')

      // If we trully want to have all dev activity for a project we atleast need to start with looping trough all the repos
      if (isProfile) {
        
      } else {
        urlParts.pop()
      }
    }
    return item
  }))
}


router.get('/top-100', async (ctx) => ctx.body = cache.currencies)

cache.currencies = await getTop100()

// runs every minute
new CronJob(
  '* * * * *',
  async () => cache.currencies = await getTop100()
)

const server = new Koa()

server.use(cors({origin: '*'}))
server.use(router.routes())

server.listen(9876)