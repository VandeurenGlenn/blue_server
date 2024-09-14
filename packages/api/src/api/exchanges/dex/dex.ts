import Provider from './provider.js'
import chainmap from '@vandeurenglenn/chainmap'
import DexWrapper from './dex-wrapper.js'
import DEXPriceError from '../../../errors/dex-price.js'

export const Dex = new (class Dex {
	ethereum = new Provider(chainmap.ethereum.mainnet.chainId)
	binanceSmartChain = new Provider(chainmap.smartchain.mainnet.chainId)

	// router addressess
	// oneInchRouterContract = '0x11111112542D85B3EF69AE05771c2dCCff4fAa26'
	uniswapV2Router02Contract = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
	pancakeV2RouterContract = '0x10ED43C718714eb63d5aA57B78B54704E256024E'

	// wrapped token addresses
	wrappedEthereumToken = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
	wrappedBNBToken = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

	// usd token addresses
	ethereumUSDToken = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
	binanceUSDToken = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'

	uniswap = new DexWrapper(
		this.wrappedEthereumToken,
		this.ethereumUSDToken,
		this.uniswapV2Router02Contract,
		this.ethereum.provider
	)

	pancakeSwap = new DexWrapper(
		this.wrappedBNBToken,
		this.binanceUSDToken,
		this.pancakeV2RouterContract,
		this.binanceSmartChain.provider
	)

	getPrice(token: string, chainId: number) {
		if (
			token === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
			token === this.wrappedEthereumToken ||
			token === this.wrappedBNBToken
		) {
			if (chainId === 1) {
				return this.uniswap.getWrappedTokenPrice()
			} else if (chainId === 56) {
				return this.pancakeSwap.getWrappedTokenPrice()
			}
		}
		if (chainId === 1) {
			return this.uniswap.getPrice(token)
		} else if (chainId === 56) {
			return this.pancakeSwap.getPrice(token)
		}
		throw new DEXPriceError('Chain not supported')
	}
})()
