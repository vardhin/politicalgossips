export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.CKalbMZG.js",app:"_app/immutable/entry/app.D5y2O2Ym.js",imports:["_app/immutable/entry/start.CKalbMZG.js","_app/immutable/chunks/eGLDC6Tn.js","_app/immutable/chunks/C6NBa0eJ.js","_app/immutable/chunks/HOlLVa_p.js","_app/immutable/entry/app.D5y2O2Ym.js","_app/immutable/chunks/C6NBa0eJ.js","_app/immutable/chunks/Bh918-OH.js","_app/immutable/chunks/D7uXA1Ur.js","_app/immutable/chunks/BHvfjOCM.js","_app/immutable/chunks/QXJAqkbd.js","_app/immutable/chunks/HOlLVa_p.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/admin/dashboard",
				pattern: /^\/admin\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/admin/login",
				pattern: /^\/admin\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/article",
				pattern: /^\/article\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
