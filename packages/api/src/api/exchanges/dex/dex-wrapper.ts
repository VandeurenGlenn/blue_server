import {AddressLike, formatUnits, parseUnits} from 'ethers'
import ERC20ABI from './abis/erc20.js'
import {Contract} from 'ethers'
import exchangeABI from './abis/exchange.js'
import DEXPriceError from '../../../errors/dex-price.js'
import {BigNumber} from '@ethersproject/bignumber'

export default class DexWrapper {
	provider: any
	wrappedToken: any
	routerAddress: any
	usdtToken: any
	constructor(wrappedToken: any, usdtToken: any, router: any, provider: any) {
		this.wrappedToken = wrappedToken
		this.usdtToken = usdtToken
		this.routerAddress = router
		this.provider = provider
	}

	async getWrappedTokenPrice() {
		return this.#getPrice(this.wrappedToken, this.usdtToken)
	}

	async #getPrice(tokenAddressIn: AddressLike, tokenAddressOut: AddressLike): Promise<string> {
		const tokenInContract = new Contract(tokenAddressIn as string, ERC20ABI, this.provider)
		const tokenOutContract = new Contract(tokenAddressOut as string, ERC20ABI, this.provider)
		const routerContract = new Contract(this.routerAddress, exchangeABI, this.provider)

		const decimalsIn = await tokenInContract.decimals()
		const decimalsOut = await tokenOutContract.decimals()

		const tokensToSell = parseUnits('1', decimalsIn)

		let amountOut
		amountOut = await routerContract.getAmountsOut(tokensToSell, [tokenAddressIn, tokenAddressOut])
		amountOut = formatUnits(amountOut[1], decimalsOut)
		return amountOut
	}

	async getPrice(tokenAddress: AddressLike) {
		try {
			const wrappedTokenPrice = await this.getWrappedTokenPrice()
			const tokenPrice = await this.#getPrice(tokenAddress, this.wrappedToken)
			return String(Number(tokenPrice) * Number(wrappedTokenPrice))
		} catch (error) {
			const message = (error as Error).message
			if (message.includes('insufficient liquidity')) {
				throw new DEXPriceError('Insufficient liquidity')
			} else if (message.includes('invalid address')) {
				throw new DEXPriceError('Invalid address')
			} else if (message.includes('missing revert data')) {
				// add to ignorelist
				// console.log('message', error.message)
			} else {
				throw new DEXPriceError(message)
			}
		}
	}
}
