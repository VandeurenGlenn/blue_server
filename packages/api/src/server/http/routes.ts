import Router from '@koa/router'
import {cache} from './../../cache.js'

const router = new Router()

router.get('/top100', async (ctx) => (ctx.body = cache.bluelist))

export const routes = router.routes()

export const allowedMethods = router.allowedMethods()

export const availableRoutes = ['/top100']
