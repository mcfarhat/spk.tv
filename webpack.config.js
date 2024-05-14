const path = require('path');

module.exports = {
  entry: {
    login: './login.js',
    fileUpload: './fileUpload.js',
    contracts: './contracts.js',
    wallet: './wallet.js',
    ui: './ui.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  mode: 'development',
};
