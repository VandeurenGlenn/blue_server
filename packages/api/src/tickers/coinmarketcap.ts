import chalk from 'chalk'
import {PropertyValues, state} from 'snar'
import {CoinMarketCap} from '../api/coinmarketcap.js'
import {Binance} from '../api/exchanges/Binance.js'
import {Coinbase} from '../api/exchanges/Coinbase.js'
import {Kraken} from '../api/exchanges/Kraken.js'
import {LIST_SIZE} from '../constants.js'
import {PubSub} from '../pubsub.js'
import {githubTicker} from './github.js'
import {Ticker} from './ticker.js'

class CoinMarketCapTicker extends Ticker {
	@state() blueAsset: BlueAsset[] | undefined = undefined

	updated(changed: PropertyValues<this>) {
		if (changed.has('blueAsset') && this.blueAsset) {
			this.logger.log('data available')
			PubSub.publish('top100', this.blueAsset)
		}
	}

	async tickerCall(): Promise<void> {
		await githubTicker.tickerComplete // making sure github is calm
		this.logger.log('ticker run starting')
		await CoinMarketCap.fetchComplete
		if (CoinMarketCap.isDataObsolete()) {
			await CoinMarketCap.fetchListings()
			await CoinMarketCap.fetchListingsInfo(CoinMarketCap.getListings().map((l) => l.id))
		}

		// TODO: This should be updated to wait if a fetch was
		// already initiating in another process, to avoid multiple fetches
		// at the same time.
		await Coinbase.fetchList()
		await Kraken.fetchList()

		Binance.fetchComplete
		if (Binance.isExchangeInfoObsolete()) {
			await Binance.fetchExchangeInfo()
		}

		const listings = CoinMarketCap.getListings(LIST_SIZE)
		const listingsInfoMap = CoinMarketCap.getListingsInfoMap()

		const assetsPromise = Promise.all(
			listingsInfoMap.map(async (asset) => {
				const slug = asset.slug
				const listing = listings.find((l) => l.slug === slug)
				// This is temporary to see if this solution works over time
				if (!listing) {
					throw new Error('listing not found from listingInfo object')
				}

				// @ts-ignore
				const blueAsset: BlueAsset = {
					id: asset.id,
					slug,
					rank: listing.cmc_rank,
					platform: listing.platform,
					platforms: asset.contract_address,
					// price: listing.quote.USD.price,
					// marketCap: listing.quote.USD.market_cap,
					// circulating_supply: listing.circulating_supply,
					changes: {
						percent_1h: listing.quote.USD.percent_change_1h,
						percent_24h: listing.quote.USD.percent_change_24h
					},
					symbol: asset.symbol,
					name: asset.name,
					logo: asset.logo,
					website: asset.urls.website[0],
					repos: asset.urls.source_code,
					exchanges: [
						...(Binance.doesPairExist(asset.symbol, 'USDT') ? ['binance' as AvailableExchange] : []),
						...(Kraken.hasAsset(asset.symbol) ? ['kraken' as AvailableExchange] : []),
						...(Coinbase.hasAsset(asset.symbol) ? ['coinbase' as AvailableExchange] : [])
					]
				}
				// blueAsset.hash = await hashIt(encode(JSON.stringify(blueAsset)))
				return blueAsset
			})
		)

		this.blueAsset = await assetsPromise
		await this.updateComplete
		this.logger.log('ticker run completed')

		// Call other tickers if needed
		if (githubTicker.isRunning()) {
			githubTicker.goToNextBatch(this)
		}
	}
}

export const coinMarketCapTicker = new CoinMarketCapTicker('cmc ticker', chalk.gray)
