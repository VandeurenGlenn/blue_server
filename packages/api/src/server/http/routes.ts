import Router from 'koa-router'
import {cache} from './../../cache.js'

const router = new Router();

router.get('/top-100', async (ctx) => (ctx.body = cache.bluelist));
router.get('/top-100-ids', async (ctx) => (ctx.body = cache.bluelist.map(item => item.id)));

export const routes = router.routes()

export const allowedMethods = router.allowedMethods()

export const availableRoutes = [
  '/top-100',
  '/top-100-ids'
]