import {API} from '@blueserver/api'
import Router from '@koa/router'

const router = new Router()

router.get('/top100', async (ctx) => (ctx.body = API.top100()))
router.get('/change24h', async (ctx) => (ctx.body = API.change24h()))
router.get('/change1h', async (ctx) => (ctx.body = API.change1h()))

export const routes = router.routes()

export const allowedMethods = router.allowedMethods()
