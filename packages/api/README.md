# blueserver/api
> server/client api provider(s)


## what?
Package containing our server and client apis
We should have atleast a Websocket one and both http and ws should have the same signatures

## usage
### http
#### client

js```
import HttpApiClient from '@blueserver/clients/http'

const client = new HttpApiClient()
await client.top100()
```

### ws
#### client
js```
import WsApiClient from '@blueserver/clients/ws'

const client = new WsApiClient()
await client.top100()

client.subscribe('top-100', list => doSomething)
```