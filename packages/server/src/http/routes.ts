import Router from '@koa/router'
import {change1h, change24h, top100} from '@blueserver/api/server/shared'

const router = new Router()

router.get('/top100', async (ctx) => (ctx.body = top100()))
router.get('/change24h', async (ctx) => (ctx.body = change24h()))
router.get('/change1h', async (ctx) => (ctx.body = change1h()))

export const routes = router.routes()

export const allowedMethods = router.allowedMethods()
