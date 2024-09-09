import Router from '@koa/router'
import {cache} from '@blueserver/api/cache'

const router = new Router()

router.get('/top100', async (ctx) => (ctx.body = cache.bluelist))
router.get(
	'/change24h',
	async (ctx) => (ctx.body = cache.bluelist.map<ChangesList>((a) => ({id: a.id, change: a.change24h})))
)
router.get(
	'/change1h',
	async (ctx) => (ctx.body = cache.bluelist.map<ChangesList>((a) => ({id: a.id, change: a.change1h})))
)

export const routes = router.routes()

export const allowedMethods = router.allowedMethods()
