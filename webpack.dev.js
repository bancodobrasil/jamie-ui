/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */

const dotenv = require('dotenv');
const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devtool: 'source-map',
  devServer: {
    host: 'localhost',
    port: 3000,
    historyApiFallback: true,
  },
  optimization: {
    runtimeChunk: 'single',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        ...process.env,
        ...dotenv.config().parsed,
      }),
    }),
    new HtmlWebpackPlugin({
      title: 'Jamie',
      template: 'index.html',
      inject: true,
      scriptLoading: 'module',
      chunks: ['index'],
      filename: 'index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
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
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
};
