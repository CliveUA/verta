module.exports = {
	files: {
		javascripts: {
			joinTo: { 'app.js': /^app/ }
		},
		stylesheets: { joinTo: 'css/app.css' }
	},
	plugins: {
		babel: { presets: ['env'] },
		autoReload: { enabled: true },
		uglify: {
			mangle: true,
			compress: {
				global_defs: {
					DEBUG: false
				}
			}
		},
		cleancss: {
			keepSpecialComments: 0,
			removeEmpty: true
		}
	},
	overrides: {
		production: {
			optimize: true,
			sourceMaps: false,
			plugins: { autoReload: { enabled: false } }
		}
	},
	paths: {
		public: 'dist'
	},
	conventions: {
		assets: [/^(?!app\/(css|js)).*/] // Files not in `css` or `js` dir (e.g img, html).
	},
	modules: {
		autoRequire: {
			'app.js': ['js/app']
		}
	}
}