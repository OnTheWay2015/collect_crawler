
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

import * as iconv from 'iconv-lite';

import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as cheerio from 'cheerio';
import * as M from "./main"; 
import * as BLUE from "./utils"; 
import { DB_handle } from './handles/dbHandler';
import { Buffer } from 'buffer';


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

let testf = ()=>{
    let htmlContent="";
    //let url = "https://www.baidu.com";
    //let url = "https://www.bxwx9.org";  //error
    //let url = "www.bxwx9.org";
    //let url = "https://www.runoob.com/nodejs/nodejs-tutorial.html";
    let url = "http://www.aoshu.com/tk/aslxt/";
    let urlst:any = BLUE.transURLSt(url);


   let h = {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      //"Accept-Encoding": "gzip, deflate",
      "Accept-Encoding": "gzip",
      //"Accept-Encoding": "deflate",
      "Accept-Language": "zh-CN,zh;q=0.9",
      "Cache-Control": "no-cache",
      //"Connection": "keep-alive",
      //"Cookie": "__utmz=220146502.1584964341.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __CITY_URL=0; __utma=220146502.1722658310.1584964341.1584964341.1585276023.2; __utmc=220146502; Hm_lvt_097b4d986b1bd8a9bffe2dd3212a9975=1584964341,1585276023; Hm_lpvt_097b4d986b1bd8a9bffe2dd3212a9975=1585276023",
      //"Host": "www.aoshu.com",
      "Pragma": "no-cache",
      //"Upgrade-Insecure-Requests": "1",
      "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36"
   };

        let h_def =  {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
            "Accept":" text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
           //"Accept-Encoding": "gzip, deflate, br",
           "Accept-Encoding": "identity",
           "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
           //"Accept-Language": "zh-CN,zh;q=0.9",
           //"Connection": "keep-alive",
           "Cache-Control": "max-age=0"
        }
    var options:any = {
        host: urlst.host,
        //port: '80',
        //port: '443',
        path: urlst.path,
        method: 'GET',
        headers: h,
     };
     if (urlst.isHttps){
         options.port = "443";
     }else{
         options.port = "80";
     }


// 处理响应的回调函数
let callback = function(response:any){
   // 不断更新数据
   let body = '';
   //var buf = new bufferhelper();
   let buf:any = null
   //response.setEncoding('utf-8'); //防止中文乱码, 不可乱用
   //response.setEncoding('gb2312'); //防止中文乱码, 不可乱用
   response.on('error', function(data:any) {
      console.log("request error:");
      console.log(data);
   });
   response.on('data', function(data:any) {
      if (buf == null){
         buf = Buffer.from(data);
      }else{
         buf = Buffer.concat([buf, Buffer.from(data)]);
      }
      body += data;
   });
   
   response.on('end', function() {
      // 数据接收完成
      //console.log(body);

      var fs = require('fs');
      fs.open('123.txt', 'w+', function (err: any, fd: any) {
         if (err) {
            console.error(err);
            return;
         }
         //fs.writeSync(fd, buf, 0, "utf-8");
         
         //fs.writeSync(fd, body,0, "utf-8");
         //fs.writeSync(fd, body,0, "gb2312");
         
          
         let zlib = require('zlib');
         zlib.gunzip(buf, function (err:any, decoded:any) {
            //console.log(decoded.toString());
            //fs.writeSync(fd, decoded,0, "utf-8");
            fs.writeSync(fd, decoded,0, "utf-8");//decode 不要 toString()
         })
         
         
         //fs.writeSync(fd, buf.toBuffer(),0, "utf-8");
         
         //iconv 
         //let x = iconv.decode(buf.toBuffer(),'gb2312');
         //let x = iconv.decode(buf.toBuffer(),'gbk');
         //let x = iconv.encode(body,'gb2312');
         //fs.writeSync(fd, x,0, "gb2312");
         //fs.writeSync(fd, x,0, "utf-8");
         //fs.writeSync(fd, x,0, "gbk");
         
         //let x = iconv.decode(buf.toBuffer(),'utf-8');
         //let x = iconv.decode(buf.toBuffer(),'gb2312');
         //fs.writeSync(fd, x,0, "utf-8");
      })
      

      //parse(body);
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
   let req;
   if (urlst.isHttps) {
      req = HTTPS.request(options, callback);
   } else {
      req = HTTP.request(options, callback);
   }
   req.end();
};


let ss = "小";
//let x = iconv.decode(Buffer.from(ss),"gb2312");
console.log(Buffer.from(ss).toString());


   let testf01 = () => {
      //let url = "http://www.runoob.com/nodejs/nodejs-tutorial.html";
      let url = "http://www.aoshu.com/tk/aslxt/";
      var zlib = require('zlib');
      HTTP.get(url,
         function (res) {
            var html: any = [];
            res.on("data", function (data) {
               html.push(data);
            })
            res.on("end", function () {
               var buffer = Buffer.concat(html);
               //console.log(buffer.toString());
               zlib.gunzip(buffer, function (err: any, decoded: any) {
                  console.log(decoded.toString());
               })
            }).on("error", function () {
               console.log("fail!")
            })
         })
   };
//testf01();
//----------------------
//var dburl = "mongodb://127.0.0.1/atttt666";
//var MongoClient = require('mongodb').MongoClient(dburl,{});
// 
//MongoClient.connect(function(err:any, db:any) {
//  if (err) throw err;
//  console.log("数据库已创建!");
//  db.close();
//});

//----------------------


    //let u = "https://www.baidu.com";
    //let u = "http://www.aoshu.com/tk/aslxt";
    let u = "http://www.aoshu.com/tk/aslxt/";
    let m:M.main;
    m= new M.main();
    m.init(()=>{
      m.start(u);
    });


//testf();


   //let dbh = new DB_handle(m.p_dbBase);
   //let dbname = "xx1ttt66";
   //let colname = "colll";
   //dbh.createDB(dbname, (err:any,res:any)=>{
   //   dbh.createIndex( (err:any,res:any)=>{
   //      console.log(err);
   //   },dbname,colname,{age:1},true)
   //});

}
//console.log("hello!");



//todo 
//数据保存
//去重,更新跳过
