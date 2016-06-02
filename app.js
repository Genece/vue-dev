var express = require('express');
var webpack = require('webpack')
var config = require('./webpack.config')


var app = express();

//// 调用webpack并把配置传递过去
//var compiler = webpack(config)
//
//var devMiddleware = require('webpack-dev-middleware')(compiler, {
//  publicPath: config.output.publicPath,
//  stats: {
//    colors: true,
//    chunks: false
//  }
//})
//
//
//// 注册中间件
//app.use(devMiddleware);




app.set('views',__dirname + '/views');
app.set('view engine','jade');
app.use(express.static(__dirname + '/public'));
app.get('/',function(req,res,next){
  res.render('index',{title:'首页'});
});

app.listen(8882,function(){
  console.log('on port 8882!');
});