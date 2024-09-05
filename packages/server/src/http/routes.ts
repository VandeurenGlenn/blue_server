import Router from '@koa/router'
import {cache} from '@blueserver/api/cache'

const router = new Router()

router.get('/top100', async (ctx) => (ctx.body = cache.bluelist))
router.get('/change24h', async (ctx) => (ctx.body = cache.bluelist.map((a) => ({id: a.id, change: a.change24h}))))

export const routes = router.routes()

export const allowedMethods = router.allowedMethods()

export const availableRoutes = ['/top100', '/change24h']
