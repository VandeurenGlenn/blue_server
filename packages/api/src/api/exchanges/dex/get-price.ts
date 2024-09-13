import {AddressLike, formatUnits, parseUnits} from 'ethers'
import ERC20ABI from './abis/erc20.js'
import {Contract} from 'ethers'
import exchangeABI from './abis/exchange.js'
export default class getPrice {
	provider: any
	wrappedToken: any
	routerAddress: any
	usdtToken: any
	constructor(wrappedToken: any, usdtToken: any, router: any, provider: any) {
		this.provider = provider
		this.wrappedToken = wrappedToken
		this.routerAddress = router
		this.usdtToken = usdtToken
	}
	async getWrappedTokenPrice() {
		const wrappedTokenContract = new Contract(this.wrappedToken, ERC20ABI, this.provider)
		const decimals = await wrappedTokenContract.decimals()

		let amountToSell = parseUnits('1', decimals)
		let amountOut
		try {
			let router = new Contract(this.routerAddress, exchangeABI, this.provider)
			amountOut = await router.getAmountsOut(amountToSell, [this.wrappedToken, this.usdtToken])
			amountOut = formatUnits(amountOut[1], decimals)
		} catch (error) {}
		if (!amountOut) return 0
		return amountOut
	}

	async getPrice(tokenAddress: AddressLike) {
		const wrappedTokenPrice = await this.getWrappedTokenPrice()

		let tokenContract = new Contract(tokenAddress as string, ERC20ABI, this.provider)
		let tokenDecimals = await tokenContract.decimals()

		const tokensToSell = parseUnits('1', tokenDecimals)

		let amountOut
		try {
			let router = new Contract(this.routerAddress, exchangeABI, this.provider)
			amountOut = await router.getAmountsOut(tokensToSell, [tokenAddress, this.wrappedToken])
			amountOut = formatUnits(amountOut[1], tokenDecimals)
		} catch (error) {
			console.log(error)
		}

		if (!amountOut) return 0
		return amountOut * wrappedTokenPrice
	}
}
