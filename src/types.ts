export declare type blueCache = { currencies: {}[] }

export declare type githubReturn = {
  activity: number,
  repos: string[]
}

export declare type top100Return = {
  id: string,
  name: string,
  slug: string,
  logo: string,
  symbol: string,
  price: number,
  description: string,
  sourceCode: string,
  github: githubReturn
}