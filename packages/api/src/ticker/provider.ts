import chainMap from '@vandeurenglenn/chainmap'
import {
	JsonRpcProvider,
	ContractRunner,
	EventEmitterable,
	TransactionRequest,
	AddressLike,
	BigNumberish,
	BlockTag,
	Filter,
	FilterByBlockHash,
	Listener,
	TransactionResponse,
	Block,
	TransactionReceipt,
	Log
} from 'ethers'
import {ProviderEvent} from 'ethers'
import {NameResolver} from 'ethers'
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

export default class Provider implements ContractRunner, EventEmitterable<ProviderEvent>, NameResolver {
	chainInfo: ChainInfo
	providers: JsonRpcProvider[]

	constructor(chainId: number) {
		// super()
		this.chainInfo = chainMap[chainId]

		this.providers = []
		for (const url of this.chainInfo.rpc) {
			this.providers.push(new JsonRpcProvider(url, this.chainInfo))
		}
	}

	#getBalance(address: AddressLike): any {
		if (this.providers.length > 0) {
			try {
				const balance = this.providers[0].getBalance(address)
				return balance
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#getBalance(address)
			}
		}
	}

	getBalance(address: AddressLike) {
		return this.#getBalance(address) as Promise<bigint>
		// console.log(this.provider.)
	}

	#send(method: string, params: any[] | Record<string, any>): any {
		if (this.providers.length > 0) {
			try {
				const data = this.providers[0].send(method, params)
				return data
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#send(method, params)
			}
		}
	}

	send(method: string, params: any) {
		return this.#send(method, params)
	}

	#call(tx: TransactionRequest): any {
		if (this.providers.length > 0) {
			try {
				return this.providers[0].call(tx)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#call(tx)
			}
		}
	}

	call(tx: any) {
		console.log(tx)

		return this.#call(tx) as Promise<string>
	}

	// @ts-ignore
	provider() {
		return this.providers[0]
	}

	#estimateGas(tx: TransactionRequest): any {
		if (this.providers.length > 0) {
			try {
				return this.providers[0].estimateGas(tx)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#estimateGas(tx)
			}
		}
	}

	estimateGas(tx: any) {
		return this.#estimateGas(tx)
	}

	#getBlockNumber(): any {
		if (this.providers.length > 0) {
			try {
				return this.providers[0].getBlockNumber()
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#getBlockNumber()
			}
		}
	}

	getBlockNumber() {
		return this.#getBlockNumber()
	}

	#getNetwork(): any {
		if (this.providers.length > 0) {
			try {
				return this.providers[0].getNetwork()
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#getNetwork()
			}
		}
	}

	getNetwork() {
		return this.#getNetwork()
	}

	#resolveName(name: string): any {
		if (this.providers.length > 0) {
			try {
				return this.providers[0].resolveName(name)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#resolveName(name)
			}
		}
	}

	resolveName(name: any) {
		return this.#resolveName(name)
	}

	#getFeeData(): any {
		if (this.providers.length > 0) {
			try {
				return this.providers[0].getFeeData()
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#getFeeData()
			}
		}
	}

	getFeeData() {
		return this.#getFeeData()
	}

	#getTransactionCount(address: AddressLike): any {
		if (this.providers.length > 0) {
			try {
				return this.providers[0].getTransactionCount(address)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#getTransactionCount(address)
			}
		}
	}

	getTransactionCount(address: AddressLike) {
		return this.#getTransactionCount(address)
	}

	#getCode(address: AddressLike): any {
		if (this.providers.length > 0) {
			try {
				return this.providers[0].getCode(address)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#getCode(address)
			}
		}
	}

	getCode(address: AddressLike) {
		return this.#getCode(address)
	}

	#getStorage(address: AddressLike, position: BigNumberish, block?: BlockTag | undefined): any {
		if (this.providers.length > 0) {
			try {
				return this.providers[0].getStorage(address, position, block)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.#getStorage(address, position, block)
			}
		}
	}

	getStorage(address: AddressLike, position: any, block?: any) {
		return this.#getStorage(address, position, block)
	}

	async broadcastTransaction(tx: string): Promise<TransactionResponse | undefined> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].broadcastTransaction(tx)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.broadcastTransaction(tx)
			}
			return result
		}
	}

	async getBlock(block: BlockTag): Promise<Block | null | undefined> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].getBlock(block)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.getBlock(block)
			}
			return result
		}
	}

	async getTransaction(hash: string): Promise<TransactionResponse | undefined | null> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].getTransaction(hash)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.getTransaction(hash)
			}
			return result
		}
	}

	async getTransactionReceipt(hash: string): Promise<TransactionReceipt | undefined | null> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].getTransactionReceipt(hash)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.getTransactionReceipt(hash)
			}
			return result
		}
	}

	async getTransactionResult(hash: string): Promise<null | string | undefined> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].getTransactionResult(hash)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.getTransactionResult(hash)
			}
			return result
		}
	}

	async getLogs(filter: Filter | FilterByBlockHash): Promise<Array<Log> | undefined> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].getLogs(filter)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.getLogs(filter)
			}
			return result
		}
	}

	async lookupAddress(address: AddressLike): Promise<string | null | undefined> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].lookupAddress(address as string)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.lookupAddress(address)
			}
			return result
		}
	}

	async waitForTransaction(
		hash: string,
		confirms: number | null | undefined,
		timeout: number | null | undefined
	): Promise<TransactionReceipt | null | undefined> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].waitForTransaction(hash, confirms, timeout)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.waitForTransaction(hash, confirms, timeout)
			}
			return result
		}
	}

	async waitForBlock(hash: BlockTag | undefined): Promise<Block | null | undefined> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].waitForBlock(hash)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.waitForBlock(hash)
			}
			return result
		}
	}

	async on(event: ProviderEvent, listener: Listener): Promise<any> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].on(event, listener)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.on(event, listener)
			}
			return result
		}
	}

	async once(event: ProviderEvent, listener: Listener): Promise<any> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].once(event, listener)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.once(event, listener)
			}
			return result
		}
	}

	async emit(event: ProviderEvent, value: any): Promise<any> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].emit(event, value)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.emit(event, value)
			}
			return result
		}
	}

	async listenerCount(event: ProviderEvent | undefined): Promise<any> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].listenerCount(event)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.listenerCount(event)
			}
			return result
		}
	}

	async listeners(event: ProviderEvent | undefined): Promise<any> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].listeners(event)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.listeners(event)
			}
			return result
		}
	}
	async off(event: ProviderEvent): Promise<any> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].off(event)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.off(event)
			}
			return result
		}
	}

	async removeAllListeners(event: ProviderEvent | undefined): Promise<any> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].removeAllListeners(event)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.removeAllListeners(event)
			}
			return result
		}
	}

	async removeListener(event: ProviderEvent, listener: Listener): Promise<any> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].removeListener(event, listener)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.removeListener(event, listener)
			}
			return result
		}
	}

	async addListener(event: ProviderEvent, listener: Listener): Promise<any> {
		if (this.providers.length > 0) {
			let result
			try {
				result = await this.providers[0].addListener(event, listener)
			} catch {
				this.providers[0].destroy()
				this.providers.shift()
				return this.addListener(event, listener)
			}
			return result
		}
	}

	destroy() {
		return this.providers[0].destroy()
	}
}
