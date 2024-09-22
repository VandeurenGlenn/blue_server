import Provider from './provider.js'
import chainmap from '@vandeurenglenn/chainmap'
import DexWrapper from './dex-wrapper.js'
import DEXPriceError from '../../../errors/dex-price.js'

export const Dex = new (class Dex {
	ethereumProvider = new Provider(chainmap.ethereum.mainnet.chainId)
	binanceSmartChainProvider = new Provider(chainmap.smartchain.mainnet.chainId)
	optimismProvider = new Provider(chainmap.optimism.mainnet.chainId)
	baseProvider = new Provider(chainmap.base.mainnet.chainId)
	polygonProvider = new Provider(chainmap.polygon.mainnet.chainId)
	arbitrumProvider = new Provider(chainmap.arbitrum.mainnet.chainId)
	// avalancheProvider = new Provider(chainmap.avalanche.mainnet.chainId)

	// router addressess
	// oneInchRouterContract = '0x11111112542D85B3EF69AE05771c2dCCff4fAa26'
	uniswapV2RouterContract = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
	pancakeV2RouterContract = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
	optimismUniswapV02RouterContract = '0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2'
	baseUniswapRouterV02Contract = '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24'
	polygonUniswapV02RouterContract = '0xedf6066a2b290C185783862C7F4776A2C8077AD1'
	// avalancheUniswapV02Router = '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24'
	arbitrumUniswapV02Router = '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9'

	// wrapped token addresses
	wrappedEthereumToken = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
	wrappedBNBToken = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
	optimismToken = '0x4200000000000000000000000000000000000042'
	baseToken = '0xd07379a755A8f11B57610154861D694b2A0f615a'
	polygonToken = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
	// avalancheToken = ''
	arbitrumToken = '0x912CE59144191C1204E64559FE8253a0e49E6548'

	// usd token addresses
	ethereumUSDToken = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
	binanceUSDToken = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
	optimismUSDToken = '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
	baseUSDCToken = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
	polygonUSDToken = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
	arbitrurmUSDToken = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
	// avalancheUSDToken = '0x6ab707aca953edaefbc4fd23ba73294241490620'

	ethereum = new DexWrapper(
		this.wrappedEthereumToken,
		this.ethereumUSDToken,
		this.uniswapV2RouterContract,
		this.ethereumProvider.provider
	)

	binanceSmartChain = new DexWrapper(
		this.wrappedBNBToken,
		this.binanceUSDToken,
		this.pancakeV2RouterContract,
		this.binanceSmartChainProvider.provider
	)

	optimism = new DexWrapper(
		this.optimismToken,
		this.optimismUSDToken,
		this.optimismUniswapV02RouterContract,
		this.optimismProvider.provider
	)

	base = new DexWrapper(
		this.baseToken,
		this.baseUSDCToken,
		this.baseUniswapRouterV02Contract,
		this.baseProvider.provider
	)

	polygon = new DexWrapper(
		this.polygonToken,
		this.polygonUSDToken,
		this.polygonUniswapV02RouterContract,
		this.polygonProvider.provider
	)

	arbitrum = new DexWrapper(
		this.arbitrumToken,
		this.arbitrurmUSDToken,
		this.arbitrumUniswapV02Router,
		this.arbitrumProvider.provider
	)

	getPrice(token: string, chainId: number) {
		if (
			token === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
			token === this.wrappedEthereumToken ||
			token === this.wrappedBNBToken ||
			token === this.optimismToken ||
			token === this.baseToken ||
			token === this.polygonToken ||
			token === this.arbitrumToken
		) {
			if (chainId === 1) {
				return this.ethereum.getWrappedTokenPrice()
			} else if (chainId === 56) {
				return this.binanceSmartChain.getWrappedTokenPrice()
			} else if (chainId === 10) {
				return this.optimism.getWrappedTokenPrice()
			} else if (chainId === 137) {
				return this.polygon.getWrappedTokenPrice()
			} else if (chainId === 250) {
				return this.base.getWrappedTokenPrice()
			} else if (chainId === 42161) {
				return this.arbitrum.getWrappedTokenPrice()
			}
		}
		if (chainId === 1) {
			return this.ethereum.getPrice(token)
		} else if (chainId === 56) {
			return this.binanceSmartChain.getPrice(token)
		} else if (chainId === 10) {
			return this.optimism.getPrice(token)
		} else if (chainId === 137) {
			return this.polygon.getPrice(token)
		} else if (chainId === 250) {
			return this.base.getPrice(token)
		} else if (chainId === 42161) {
			return this.arbitrum.getPrice(token)
		}
		throw new DEXPriceError('Chain not supported')
	}
})()
