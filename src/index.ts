
//
//import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
//// 明确类型麻烦些，却会获得非常详细的语法提示
// 
//const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
//    res.statusCode = 200;
//    res.setHeader("Content-Type", "text/plain");
//    res.end("Hello World\n");
//})
//
//const hostname: string = "127.0.0.1";
//const port: number = 3000;
//server.listen(port, hostname, () => {
//    console.log(`Server running at http://${hostname}:${port}/`);
//})
//console.log("hello!");
//


//import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
//import * as HTTP from 'http';
import * as HTTP from 'https';
import * as cheerio from 'cheerio';
import * as M from "./main"; 
import * as BLUE from "./utils"; 
module TTT {
    //class ttt {
    //    constructor(){
    //        console.log("hello!");
    //    }
    //}
    //new ttt();
    //var options = {
    //    host: 'localhost',
    //    port: '8080',
    //    path: '/index.html'  
    // };

    let m:M.main;
    let htmlContent="";
    //let url = "";
    
    let url = "www.baidu.com";
    //let url = "https://www.bxwx9.org";  //error
    //let url = "www.bxwx9.org";
    var options = {
        host: url,
        //port: '80',
        port: '443',
        path: '/',
        method: 'GET',
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
            "Accept":" text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
           //"Accept-Encoding": "gzip, deflate, br",
           "Accept-Encoding": "identity",
           "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
           //"Connection": "keep-alive",
           "Cache-Control": "max-age=0"
        }
     };
    //var options = {
    //    host: url,
    //    //port: '80',
    //    port: '443',
    //    path: '/',
    //    method: 'GET',
    //    "agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
    //    headers: {
    //        //"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
    //        "Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
    //        "Accept":" text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    //       "Accept-Encoding": "gzip, deflate, br",
    //       "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    //       "Cache-Control": "max-age=0",
    //       "Connection": "keep-alive"
    //    }
    // };



// 处理响应的回调函数
var callback = function(response:any){
   // 不断更新数据
   var body = '';
   response.setEncoding('utf-8'); //防止中文乱码
   response.on('error', function(data:string) {
      console.log("request error:");
      console.log(data);
   });
   response.on('data', function(data:string) {
      body += data;
   });
   
   response.on('end', function() {
      // 数据接收完成
      //console.log(body);
      parse(body);
   });

   let parse = (html:string)=>{
        let $ = cheerio.load(html); //采用cheerio模块解析html
        //let select = "td[class='headfont12']";
        let select = "head";
        let s = $(select);
        BLUE.log(s.text());
   }

}
// 向服务端发送请求
//var req = HTTP.request(options, callback);
//req.end();



        //HTTP.get(url, function (res) { 
        //    res.setEncoding('utf-8'); //防止中文乱码
        //    //监听data事件，每次取一块数据
        //    res.on('data', function (chunk) {   
        //        htmlContent += chunk;
        //        //self.m_html += chunk;
        //        console.log( " ---- task_get process ----");
        //    });
        //    //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        //    res.on('end', function () {
        //        console.log( " ---- task_get run ----");
        //        console.log( htmlContent );
        //        //console.log(self.m_html);
        //        //self.m_cbfun( self.m_html );
        //        //if (cb) cb();
        //    });
        //}); 




    //let u = "https://www.baidu.com";
    //let u = "http://www.aoshu.com/tk/aslxt";
    let u = "http://www.aoshu.com/tk/aslxt/";
    m= new M.main();
    m.init();
    m.start(u);
}
//console.log("hello!");


//todo 
//数据保存
//去重,更新跳过
