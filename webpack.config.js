// const path = require('path')
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CleanWebpackPlugin = require('clean-webpack-plugin')
// const {GenerateSW} = require('workbox-webpack-plugin');

// module.exports = {
//     entry: "./entry.js",
//     output: {
//         path: path.resolve(__dirname),
//         filename: "bundle.js"
// 		},
// 		mode: 'production',
// 		devtool: 'cheap-eval-source-map',
// 		plugins: [
// 			new CleanWebpackPlugin(['dist']),
// 			new HtmlWebpackPlugin({
// 				template: './index.html'
// 			}),
// 			new GenerateSW({
// 				swDest: "sw.js",
// 				skipWaiting: true,
// 				clientsClaim: true,
// 				runtimeCaching: [{
// 					urlPattern: new RegExp('http://localhost:8000/'),
// 					handler: 'staleWhileRevalidate'
// 				}]
// 			}),
// 		],
//     module: {
//       	rules: [
//       		{
//       			test: /\.css$/,
//       			use: [
//       				{
//       					loader: "style-loader"
//       				},
//       				{
//       					loader: 'css-loader',
//       					options: {
//       				    	minimize: true 
//       				 	}
//       				}	
//       				]
//       		},
//       		{
//       			test: /\.(png|svg|jpg|gif)$/,
//       			use: [
//               {
//                 loader: 'image-webpack-loader',
//       					options: {
//       						optipng: {
// 										enabled: true,
// 										optimizationLevel: 4
//       						}
//       					}
//               },
//               {
//                 loader: 'responsive-loader',
//                 options: {
//                   sizes: [300, 600, 800],
//                   name: 'images/[name]-[width].[ext]'
//                 }
//               },

//       			]
//       		}	
//       	]
//       }

// };