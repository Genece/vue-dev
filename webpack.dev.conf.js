var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path');
var webpack = require('webpack');
//// 引入基本配置
var config = require('./webpack.config');
//
config.output.publicPath = './static/';
config.plugins = [

  new HtmlWebpackPlugin({
    //path:'views',
    filename:'../index.jade',
    template: path.resolve(__dirname, '../app/index/index.jade'),
    inject:true
  }),
];
