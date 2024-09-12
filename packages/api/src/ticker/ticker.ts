import Provider from './provider.js'
import chainmap from '@vandeurenglenn/chainmap'
import {Contract} from 'ethers'
import getPrice from './get-price.js'

export class DexTicker {
	ethereum = new Provider(chainmap.ethereum.mainnet.chainId)
	binanceSmartChain = new Provider(chainmap.smartchain.mainnet.chainId)

	oneInchRouterContract = '0x11111112542D85B3EF69AE05771c2dCCff4fAa26'
	pancakeRouterContract = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
	uniswapV2Router02Contract = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
	wrappedBNBTokenAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
	binanceUSDToken = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
	ethereumUSDToken = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
	wrappedEthereumToken = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'

	uniswap = new getPrice(
		this.wrappedEthereumToken,
		this.ethereumUSDToken,
		this.uniswapV2Router02Contract,
		this.ethereum.provider
	)

	pancakeSwap = new getPrice(
		this.wrappedBNBTokenAddress,
		this.binanceUSDToken,
		this.pancakeRouterContract,
		this.binanceSmartChain.provider
	)
}
