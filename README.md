# MQTT microservice Server

## Protocol

### Incoming

`/login` a register message send by a client
`/request/{servicename}` request to start a service or send its IP

### Outgoing

#### /{clientname}/

- `start` call to start a service
- `function` execute a function on a client
- `ownService/{servicename}` call to start an ownService which is a service that only affects the client
- `ownService/{servicename}/data` send data to that service
