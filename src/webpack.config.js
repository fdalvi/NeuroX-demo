var webpack = require('webpack');
var glob = require('glob');
var path = require('path');
var dependencies = require('./package.json').dependencies;

var BUILD_DIR = path.resolve(__dirname, 'client/dist');
var APP_DIR = path.resolve(__dirname, 'client/assets');

function isExternal(module) {
	var userRequest = module.userRequest;

	if (typeof userRequest !== 'string') {
		return false;
	}
	
	for (var dependency in dependencies) {
		if (userRequest.indexOf(dependency) >= 0)
			return true;
	}

	return false;
}

var config = {
	entry: {
		index: APP_DIR + '/index.jsx',
		analyze: APP_DIR + '/analyze.jsx'
	},
	resolve: {
		extensions: ['.json', '.jsx', '.js', '.scss', '.css']
	},
	output: {
		path: BUILD_DIR,
		filename: '[name].js'
	},
	module : {
		rules : [
			{ test: /\.jsx?/, include: APP_DIR, loader: 'babel-loader' },
			{
				test: /\.css$/, 
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.scss$/, 
				use: [
					"style-loader",
					"css-loader",
					{
						loader: 'sass-loader',
						options: {
							includePaths: glob.sync('node_modules').map((d) => path.join(__dirname, d))
						}
					}
				]
			},
			{
				test: /\.less$/,
				use: [
					"style-loader",
					"css-loader",
					"less-loader"
				]
			}
		]
	},
	optimization: {
	  splitChunks: {
	    cacheGroups: {
	      vendor: {
	        chunks: "initial",
	        test: path.resolve(__dirname, "node_modules"),
	        name: "vendor",
	        enforce: true
	      }
	    }
	  },
	  minimize: true
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {
				sassLoader: {
					includePaths: [path.resolve(__dirname, "./node_modules")]
				}
			}
		})
  	],
  	mode: 'production'
};

module.exports = config;