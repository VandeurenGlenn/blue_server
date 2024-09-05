import Koa from 'koa'
import cors from '@koa/cors'
import {routes, allowedMethods} from './routes.js'
import {availableRoutes} from '@blueserver/api/constants'

export class HttpApiServer {
	server: Koa = new Koa()
	constructor({port = 9876}: {port?: number}) {
		this.server
			.use(cors({origin: '*'}))
			.use(routes)
			.use(allowedMethods)

		this.server.listen(port)
		console.group('available endpoints')
		for (const endpoint of availableRoutes) {
			console.log(`endpoint at http://localhost:${port}/${endpoint}`)
		}
		console.groupEnd()
	}
}

