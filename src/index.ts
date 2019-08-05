
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
import * as HTTP from 'http';
//import * as HTTP from 'https';
import * as cheerio from 'cheerio';
import * as M from "./main"; 
import * as BLUE from "./utils"; 
import * as fs from "fs"; 

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
   
    
    let host="img.eduuu.com"
    let path="/website/zhongkao/images/mainsite/zyk2013/wxpic.jpg"
    //let url = "www.baidu.com";
    //let url = "https://www.bxwx9.org";  //error
    //let url = "www.bxwx9.org";
    var options = {
        host: host,
        port: '80',
        //port: '443',
        path: path,
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
   //var bbb = new Buffer('','utf-8')
   //var bbb = Buffer.alloc(10);
   let bbb:any=null ;
   let wlen:number = 0;
   response.setEncoding('utf-8'); //防止中文乱码
   response.on('error', function(data:string) {
      console.log("request error:");
      console.log(data);
   });
   response.on('data', function(data:string) {
      if (bbb == null){
         let l = parseInt(response.headers["content-length"]);
         bbb = Buffer.alloc(l);
      }
      //body += data;
      bbb.write(data,wlen,data.length);
      wlen+= data.length;
   });
   
   response.on('end', function() {
      // 数据接收完成
      //console.log(body);
         let l =  body.length;//45787
         let len =  bbb.length;//45787
        fs.writeFile("/home/blue/ttt.jpg", bbb,  (err) => {
            if (err) {
                BLUE.error(err.message);
                return;
            }

        });
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
    //m.init();
    //m.start(u);
}
//console.log("hello!");


//todo 
//数据保存
//去重,更新跳过

//-------------------保存文件 
let src ="http://img.eduuu.com//website/aoshu/images/mainsite/index/aoshu_wxpic.jpg" ;
let file:any;
   //HTTP.get(src, (res) => {
   //   //.faq 为什么保存的文件是错的?
   //   res.on('data', (chunk) => {
   //      file += chunk;
   //   })

   //   res.on('end', () => {
   //      let filep = Math.random() + "";
   //      //if(!fs.existsSync(filep)){ //每个文件创建一个文件夹
   //      //    var creats = fs.mkdirSync(filep);
   //      //    }
   //      fs.writeFile("ttt.jpg", file, (err) => {
   //         if (err) throw err;
   //      });
   //   })
   //})

import * as request from "request";

function downloadFile(uri:string,filename:string,callback:()=>void){
   var stream = fs.createWriteStream(filename);
   request(uri).pipe(stream).on('close', callback); 
}

//downloadFile(src,"ttt/ttt.jpg",()=>{
//});


//------------------- puppeteer 
// 基于puppeteer模拟登录抓取页面  https://www.cnblogs.com/Johnzhang/p/9010585.html
//
import * as  puppeteer from "puppeteer";
let ptest = async () => {
  const browser = await (puppeteer.launch({
    // 若是手动下载的chromium需要指定chromium地址, 默认引用地址为 /项目目录/node_modules/puppeteer/.local-chromium/
    //executablePath: '/Users/huqiyang/Documents/project/z/chromium/Chromium.app/Contents/MacOS/Chromium',
    //设置超时时间
    timeout: 15000,
    //如果是访问https页面 此属性会忽略https错误
    ignoreHTTPSErrors: true,
    // 打开开发者工具, 当此值为true时, headless总为false
    devtools: false,
    // 关闭headless模式, 不会打开浏览器
    headless: false
    //headless:true   //没有用
  }));
  const page = await browser.newPage();
  //await page.goto('https://www.jianshu.com/u/40909ea33e50');
  await page.goto('https://www.baidu.com');
   let content = await page.content();  
   let $ = cheerio.load(content); //采用cheerio模块解析html
  //await page.screenshot({
  //  path: 'jianshu.png',
  //  type: 'png',
  //  // quality: 100, 只对jpg有效
  //  fullPage: true,
  //  // 指定区域截图，clip和fullPage两者只能设置一个
  //  // clip: {
  //  //   x: 0,
  //  //   y: 0,
  //  //   width: 1000,
  //  //   height: 40
  //  // }
  //});
  browser.close();
};

ptest();

/**
用 cnpm 安装
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm i puppeteer


https://www.jianshu.com/p/a9a55c03f768

API
https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageclickselector-options 
* 
 */





//-------------------- db
import { DbManager } from './db/dbManager';
let mm: M.main = new M.main();
let p_dbMgr = new DbManager(mm);
p_dbMgr.init({

   host: "localhost",
   user: "root",
   password: ""

});

//p_dbMgr.createDb("testdb", (err:any,p1:any,p2:any)=>{
//
//   console.log("create database testdb!!");
//});
//-------------------- 
