var webpack = require('webpack');
var glob = require('glob');
var path = require('path');
var dependencies = require('./package.json').dependencies;

var BUILD_DIR = path.resolve(__dirname, 'client/dist');
var APP_DIR = path.resolve(__dirname, 'client/components');

const HtmlWebpackPlugin = require('html-webpack-plugin');

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
		index: APP_DIR + '/index/Index.jsx',
		analyze: APP_DIR + '/analyze/Analyze.jsx'
	},
	resolve: {
		extensions: ['.json', '.jsx', '.js', '.scss', '.css']
	},
	output: {
		path: BUILD_DIR,
		filename: 'js/[name].[chunkhash].js',
		publicPath: '/'
	},
	module : {
		rules : [
			{
				test: /\.jsx?/,
				include: APP_DIR,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', { modules: false }], '@babel/preset-react']
					}
				}
			},
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
			chunks: "all",
			test: path.resolve(__dirname, "node_modules"),
			name: "vendor"
		  }
		}
	  },
	  minimize: true,
	  usedExports: true
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './client/index.html',
			chunks: ['vendor', 'index']
		}),
		new HtmlWebpackPlugin({
			filename: 'analyze.html',
			template: './client/analyze.html',
			chunks: ['vendor', 'analyze']
		}),
		new webpack.LoaderOptionsPlugin({
			options: {
				sassLoader: {
					includePaths: [path.resolve(__dirname, "./node_modules")]
				}
			}
		})
	],
	mode: "production",
	devtool: 'source-map'
};

module.exports = config;