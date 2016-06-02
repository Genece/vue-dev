var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');


module.exports = {
  // 入口文件，path.resolve()方法，可以结合我们给定的两个参数最后生成绝对路径，最终指向的就是我们的index.js文件
  entry:path.resolve(__dirname, './public/src/main.js'),
  // 输出配置
  output: {
    // 输出路径是 myProject/output/static
    path: path.resolve(__dirname, './public/static/'),
    publicPath: './static/',
    //filename:'build.js'
    filename: '[name].[hash].js',
    chunkFilename: '[id].[chunkhash].js'
  },
  resolve: {
    extensions: ['', '.js', '.vue']
  },
  module: {

    loaders: [
      // 使用vue-loader 加载 .vue 结尾的文件
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        exclude: /node_modules|vue\/dist|vue-router\/|vue-loader\/|vue-hot-reload-api\//,
        loader: 'babel'
      }
    ]
  },
  babel: {
    presets: ['es2015'],
    plugins: ['transform-runtime']
  },
  plugins: [
    new CleanWebpackPlugin(['./public/static/**.js'],console.log(2222)),
    new HtmlWebpackPlugin({
      path:'views',
      filename:'../../views/index.jade',
      template: './views/jade/index.jade',
    }),
    //new webpack.HotModuleReplacementPlugin(),
  ]
}