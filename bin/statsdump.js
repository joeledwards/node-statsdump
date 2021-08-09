#! /usr/bin/env node

const app = require('@buzuli/app')
const yargs = require('yargs')

app()(async () => {
  const options = yargs
    .command('$0', 'run a StatsD server which reports all metrics to the console', yarg => {
      yarg
        .option('bind-address', {
          type: 'string',
          desc: 'the address on which the server should listen',
          default: '0.0.0.0',
          alias: ['ba', 'a'],
        })
        .option('bind-port', {
          type: 'number',
          desc: 'the port on which the server should listen',
          default: '8125',
          alias: ['bp', 'p'],
        })
        .option('json', {
          type: 'boolean',
          desc: 'dump each metric as a json record',
          alias: 'j',
        })
        .option('raw', {
          type: 'boolean',
          desc: 'dump the raw data received by the server rather than splitting out individual metrics',
          alias: 'r',
        })
    })
    .parse()

  await server(options)
})


async function server ({
  bindAddress,
  bindPort,
  json,
  raw,
}) {
  const server = require('dgram').createSocket('udp4')
  const logger = console

  function now () {
    return (new Date()).toISOString()
  }

  server.on('error', error => {
    logger.error(`Server error:`, error)
    server.close()
    process.exit(1)
  })

  server.on('listening', () => {
    const addr = server.address()
    logger.log(`Server is listening on ${addr.address}:${addr.port}`)
  })

  server.on('message', (msg, rinfo) => {
    if (raw) {
      logger.log(msg.toString())
    } else {
      msg.toString()
        .trim()
        .split('\n')
        .forEach(line => {
          // Trim off any metadata
          const [metric, meta] = [...line.split('#'), '', '']

          // Split out metric fields
          const [name, data] = [...metric.split(':'), '', '']
          const [value, metricType] = [...data.split('|').filter(f => f !== ''), '', '']

          if (name === '' || value === '') {
            console.error(`Invalid Record => "${line}"`)
          }

          if (json) {
            logger.log(
              JSON.stringify({
                timestamp: now(),
                metric: name,
                value: value,
                type: metricType,
              })
            )
          } else {
            logger.log(`[${now()}] ${name} ${value} ${metricType}`)
          }
        })
    }
  })

  server.bind(bindPort, bindAddress)
}
