/* eslint-disable @typescript-eslint/no-var-requires */

const dotenv = require('dotenv');
const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    host: 'localhost',
    port: 3000,
    historyApiFallback: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        ...process.env,
        ...dotenv.config().parsed,
      }),
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              attributes: {
                nonce: 'DayPicker',
              },
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          { loader: 'postcss-loader' },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
