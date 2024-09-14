import chainMap from '@vandeurenglenn/chainmap'
import {FallbackProvider, JsonRpcProvider} from 'ethers'

export type CurrencyInfo = {
	name: string
	symbol: string
	decimals: number
	iconUrl?: string
}

export type ChainInfo = {
	name: string
	chainId: number
	rpc: string[]
	currency: CurrencyInfo
	explorerUrl?: string
	iconUrl?: string
}

export default class Provider {
	chainInfo: ChainInfo
	providers: JsonRpcProvider[]
	provider: FallbackProvider

	constructor(chainId: number) {
		this.chainInfo = chainMap[chainId]

		this.providers = []
		for (const url of this.chainInfo.rpc) {
			const provider = new JsonRpcProvider(url, this.chainInfo)
			provider.on('error', (error) => {
				if (error.message.includes('failed to bootstrap network detection')) {
					this.providers.splice(this.providers.indexOf(provider), 1)
					provider.destroy()
					this.provider = new FallbackProvider(this.providers, this.chainInfo, {quorum: 0.2})
				}
			})
			this.providers.push(provider)
		}
		this.provider = new FallbackProvider(this.providers, this.chainInfo, {quorum: 0.2})
	}
}
