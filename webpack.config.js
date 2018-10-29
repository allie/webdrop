const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		app: ['@babel/polyfill', './src/js/app.js', './src/scss/styles.scss'],
	},
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'assets/js/[name].min.js'
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'assets/css/[name].css',
			chunkFilename: 'assets/css/[id].css'
		}),
		new HtmlWebpackPlugin({
			hash: true,
			title: 'WebDrop',
			template: './src/index.html',
			filename: './index.html'
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader',
					'postcss-loader',
					'sass-loader'
				]
			}
		]
	},
	devtool: 'source-map',
	devServer: {
		publicPath: '/',
		contentBase: './public',
		hot: false
	}
};
