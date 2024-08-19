<h1 align="center" title="nano-spawn">
	<img src="media/logo.jpg" alt="nano-spawn logo">
</h1>

> Tiny process execution for humans — a better [`child_process`](https://nodejs.org/api/child_process.html)

> [!WARNING]
> This package is still a work in progress.

Check out [`execa`](https://github.com/sindresorhus/execa) for more features.

## Features

- Outputs combined result of stdout and stderr, similar to what you get in terminals
- Outputs lines
- No dependencies

## Install

```sh
npm install nano-spawn
```

## Usage

```js
import $ from 'nano-spawn';

const result = await $('echo', ['🦄']);

console.log(result.exitCode);
//=> 0
```

```js
import $ from 'nano-spawn';

for await (const line of $('ls', ['--oneline'])) {
	console.log(line);
}
//=> index.d.ts
//=> index.js
//=> …
```

## API

See the [types](index.d.ts) for now.

## Limitations

- It does not handle binary output. Use [`execa`](https://github.com/sindresorhus/execa) for that.

## Related

- [execa](https://github.com/sindresorhus/execa) - Process execution for humans
- [unicorn-magic](https://github.com/sindresorhus/unicorn-magic/blob/6614e1e82a19f41d7cc8f04df7c90a4dfe781741/node.d.ts#L77-L125) - Slightly improved `child_process#execFile`
