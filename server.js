var PORT=8888;

var fs = require('fs');            // 用于处理本地文件
var url = require('url');           //解析url

//nodejs express框架
var express = require('express');
var app = express();
var bodyParser = require('body-parser'); //express中间件，解析客户端请求的body中的内容
var multer = require('multer');//express中间件，处理文件上传
var session = require('express-session');//express中间件，用于记录用户名密码
var path = require('path');
 
//设置ejs渲染
app.set('views', __dirname);
app.set( 'view engine', 'html' );
app.engine( '.html', require( 'ejs' ).__express );
 
//设置bodyParser和multer
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

//静态目录
app.use(express.static(path.join(__dirname, 'public')));

//服务器依据不同的url获取由get方式传递的数据
app.get('/', function(req, res) {
　　res.render('arch4');
});


//将json文件传给客户端
app.get('/info*', function(req, res) {
	var pathname = url.parse(req.url).pathname;
    console.log("pathname : "+pathname); 
    var filename="json/"+pathname.substring(6)+".json";
    console.log("filename : "+filename);

    var archi_txt=fs.readFileSync(filename);
    res.write(archi_txt.toString()); 
    res.end();
});


//运行服务器
app.listen(PORT);
console.log("Server runing at port: " + PORT + ".");
