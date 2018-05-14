const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: "./entry.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "bundle.js"
    },
    module: {
      	rules: [
      		{
      			test: /\.css$/,
      			use: [
      				{
      					loader: "style-loader"
      				},
      				{
      					loader: 'css-loader',
      					options: {
      				    	minimize: true 
      				 	}
      				}	
      				]
      		},
      		{
      			test: /\.(png|svg|jpg|gif)$/,
      			use: [
      				{
                loader: 'file-loader',
              },
              {
                loader: 'image-webpack-loader',
      					options: {
      						optipng: {
      							enabled: true,
      						}
      					}
              },
              {
                loader: 'responsive-loader',
                options: {
                  sizes: [400, 800],
                  name: 'images/[name]-[width].[ext]'
                }
              },
             
      			]
      		}	
      	]
      }
   
};
