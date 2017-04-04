module.exports = web

const http = require('http')

const {
	mapObjIndexed,
	values,
	keys,
	find,
	and,
	bind,
	call,
	compose
} = require('ramda')


const parse = compose(values, mapObjIndexed((functions, path) => {
	return {
		path: RegExp(path),
		functions
	}
}))

const findMatch = (url, handlers) => {
	const match = find(({path}) => path.exec(url), handlers)
	if (!match) return
	return {
		args: match.path.exec(url).slice(1),
		functions: match.functions
	}
}

const headers = response => bind(response.setHeader, response)

function web(handlers) {
	handlers = parse(handlers)
	http.createServer((request, response) => {
		const match = findMatch(request.url, handlers)
		if (!match) return response.end()
		const out = call(match.functions[request.method],
			headers(response),
			...match.args,
			request.body
		)
		response.write(out)
		response.end()
	}).listen(process.env.PORT || 3333)
}

web({
	'/(.*)/(.*)': {
		GET(headers, name, age) {
			return `hello, ${name}! i hear you're ${age}.`
		},
		POST(headers, x, y, body) {
			return `hello ${x}, ${y}, ${body}`
		}
	}
})
