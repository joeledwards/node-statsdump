# statsdump

Simple StatsD server which logs received metrics to the console.

## Running

Run via npx:

```
$ npx statsdump
```

Install globally, then run via the exposed `statsdump` command:

```
$ npm i -g statsdump
$ statsdump
```

## Custom options

By default, statsdump will break apart records and write each out in a custom format.

`[<iso-8601-timestamp>] <metric.name> <metric-value> <metric-type>`

### Json output

When run with the `--json` option, statsdump will format each metric record as JSON (on a single line, record structure below is multi-line for your convenience).

```json
{
  "timestamp": "<iso-8601-timestamp>",
  "metric": "<metric.name>",
  "value": "<metric-value>",
  "type": "<metric-type>",
}
```

### Raw output

When run with the `--raw` option, statsdump will write out exactly what it received.

Example format:
`<metric.name>:<metric.value>|<metric-type>[|#<metadata>]`

