export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		switch (request.method) {
			case "GET": {
				const object = await env.Bucket.get(key);
				if (!object) return new Response("Not found.", { status: 404 });
				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);
				return new Response(object.body, { status: 200 });
			}
			case "PUT": {
				const auth_token = request.headers.get('Authorization');
				if (!auth_token) return new Response("Missing Authorization token.", { status: 400 });
				if (auth_token !== env.AUTH_KEY_SECRET) return new Response("Invalid Authorization token.", { status: 401 });
				const object = await env.Bucket.put(key, request.body);
				return new Response(object, { status: 201 });
			}
			case "DELETE": {
				const auth_token = request.headers.get('Authorization');
				if (!auth_token) return new Response("Missing Authorization token.", { status: 400 });
				if (auth_token !== env.AUTH_KEY_SECRET) return new Response("Invalid Authorization token.", { status: 401 });
				const object = await env.Bucket.delete(key);
				return new Response("Deleted!", { status: 200 });
			}
			default: {
				return new Response("Method not allowed.", { status: 405, headers: { 'Allow': 'GET, PUT, DELETE' } });
			}
		}
	}
};