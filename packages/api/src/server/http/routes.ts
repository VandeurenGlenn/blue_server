import Router from 'koa-router'
import { cache } from '@blueserver/cache';

const router = new Router();

router.get('/top-100', async (ctx) => (ctx.body = cache.bluelist));

export const routes = router.routes()

export const allowedMethods = router.allowedMethods()

export const availableRoutes = [
  '/top-100'
]