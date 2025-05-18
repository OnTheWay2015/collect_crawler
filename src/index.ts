`process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';`
import * as iconv from 'iconv-lite';
//import testjson from "../configs/config.join"

import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as cheerio from 'cheerio';
import * as BLUE from "./utils"; 
import { Buffer } from 'buffer';

import * as tls  from 'tls';

import { HttpHandle } from "./handles/request";
import * as PUPPETEER from 'puppeteer';
import * as FS from 'fs';
import * as PATH from 'path';

//import got, { GotPromise, Response } from 'got';
import got  from 'got';
//import  got  = require('got');
//import * as GOT  from 'got';
import { CookieJar } from 'tough-cookie';

import { app_hehe } from './work/hehe/app_hehe';
import { noval_APP } from './work/noval/noval_APP';
import { noval01_APP } from './work/noval01/noval01_APP';
import { ConfMgr } from './conf';
import { MakeAction } from './acts/_actions';
import { ActionHolderBase } from './acts/holderbase';
import { ActionBase } from './acts/actionbase';
//import { QQMC_APP } from './work/qqmc/QQMC_APP';
//import { KY_APP } from './work/djkuyao/KY_APP';
//import { appWork } from './work/kekedj/appWork';

module TTT {
   //------------- 
   //let url ="http://www.djye.com";//root
   //let url ="http://www.djye.com/list/xc_0_460.html";//page
   //let url ="http://www.djye.com/player/25473.htm";//download page
   //------------- 
   //let url ="https://www.djkuyao.com/dance";//root
   //let url ="https://www.baidu.com"
   //let url="http://www.aixiashu.info/109/109533/41816930.html"//招黑体质开局修行在废土 
   //let url="https://www.69shuba.com/book/58981.htm"//403 
   let url ="https://m.1qxs.com/xs/84660/1";
   
   //let url ="https://www.djkuyao.com/dance/play-64617.html";//page
   //------------- 
   

    let test_view = async ()=>{
      //puppeteer api文档
      //https://puppeteer.bootcss.com/api 

      PUPPETEER.defaultArgs({
         headless:true, //是否无头模式
      })

      const brower = await PUPPETEER.launch();
      const page = await brower.newPage();


    // 将webdriver字段删除，防止反爬虫
    await page.evaluateOnNewDocument(() => {
        let a:any = navigator
        const newProto = a.__proto__;
        delete newProto.webdriver;
        a.__proto__ = newProto;
    })
    // 设置useragent，如果headless设置为true，则必做
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.564.41');

      await page.setViewport({width:1080,height:720});
      await page.goto(url);


      //await page.waitForSelector('ul.gl-warp>li'); //等待选择器要选的元素,复杂选择器
      //await page.waitForSelector('#s_btn_wr>#su'); //

//
      await page.screenshot({
         path:"./test.png"
         ,type:"png"
      });

      
      //await page.waitFor(15000);
      await new Promise(r => setTimeout(r, 10000));
      
      let h: any = await page.$("html");
      //BLUE.log(h.innerText); 
      //BLUE.log(h.innerHTML);
      let html = await h.evaluate((node: any) => node.innerHTML);
      //BLUE.log(html);
      FS.writeFileSync(PATH.join("./", "exportHtml.html"), html); 

      let content = await page.content();
      //BLUE.log(content);


      //await page.waitForSelector('.bg s_btn_wr>#su'); //s_btn_wr
      await page.waitForSelector('#su'); //s_btn_wr
      await page.waitForSelector('#kw'); //s_btn_wr

      let input_kw: any = await page.$('#kw');
      let btn_su: any = await page.$('#su');
      await input_kw.type("666");
      await btn_su.click();

      //await page.waitFor(15000);
      await new Promise(r => setTimeout(r, 10000));
      await page.screenshot({
         path:"./test_after.png"
         ,type:"png"
      });


      await page.close();
      await brower.close();




   };

   let test_got = async ()=>{
      //const got = require('got');
      //const { CookieJar } = require('tough-cookie');
      
      // 创建带 Cookie 管理的实例
      //const cookieJar = new CookieJar();

      //const https = require('https');
      //const tls = require('tls');
      
      // 创建自定义 TLS 上下文（模拟 Chrome 120+）
      const chromeTLSContext = tls.createSecureContext({
        minVersion: 'TLSv1.3',  // 强制 TLS 1.3:ml-citation{ref="8" data="citationList"}
        maxVersion: 'TLSv1.3',
        ciphers: [
          'TLS_AES_128_GCM_SHA256',      // Chrome 默认优先套件
          'TLS_CHACHA20_POLY1305_SHA256',
          'TLS_AES_256_GCM_SHA384'
        ].join(':'),  // 按优先级排序:ml-citation{ref="8" data="citationList"}
        honorCipherOrder: true,  // 遵循服务端顺序
        ecdhCurve: 'X25519',     // 强制使用 Chrome 的椭圆曲线:ml-citation{ref="8" data="citationList"}
        sigalgs: 'ecdsa_secp256r1_sha256'  // 签名算法白名单:ml-citation{ref="6" data="citationList"}
      });
      
      // 构建自定义 HTTPS Agent
      const chromeAgent = new HTTPS.Agent({
        secureContext: chromeTLSContext,
        keepAlive: true,
        maxSockets: 5,
        //ALPNProtocols: ['h2', 'http/1.1'],  // 模拟 Chrome ALPN 扩展顺序:ml-citation{ref="8" data="citationList"}
        //servername: 'target.domain'         // 显式设置 SNI:ml-citation{ref="8" data="citationList"}
      });
      
      const response = await got(url, {
         //agent:  chromeAgent ,
         headers: {
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            'Accept-Language': 'en-US,en;q=0.9'
         },
         followRedirect: true  // 处理 30x 重定向逻辑
      }).then((response: any) => {
         console.log(response.body);
      }).catch((error: any) => {
         console.error(`请求失败: ${error.message}`);
      });
   };


   let test_url = async ()=>{
      let headerobj = {};
      let req = new HttpHandle(url, null, headerobj, "GET");
        req.act(
         (htmlstr: string, res: any)=>{
            console.log(htmlstr);
         },
         (e: any, res: any)=>{
            console.log("err");
         },
         false /*resetflag*/, false);

   };

   //test
   //test_view ();
   //test_got(); //没有用.. 不过可以简化 http请求
   //test_url();

   //work
   //let a =new KY_APP();
   //let a =new appWork();
   //let a =new app_hehe();
   
   
   //let a =new QQMC_APP();
   
   
   //let a =new noval_APP();

process.argv.forEach((val, index) => { 
  console.log(`${index}: ${val}`); 
});


   //let p = "./configs/config.json"
   ConfMgr.init(process.argv[2]);
   let n = 33;

   let entry = ConfMgr.GetActionEntry();
   let acts_h:ActionHolderBase[] = [];

   //let aid = parseInt(process.argv[3]);
   let count = 0;
   entry.forEach((id) => {
      let Conf = ConfMgr.GetActionConfigById(Number(id));
      if (Conf) {
         let holder = new ActionHolderBase(()=>{
            count++;
            BLUE.log(" end:" + count)     
            if (count >= acts_h.length){
               console.log("all end!!!!!!"); 
            }
         });
         let act = MakeAction({},{}, holder, null, Conf, 0);
         if (act) {
            act.StartActionConfig();
            holder.AddAct(act);
            acts_h.push(holder);
         }
      }


   });

   if (acts_h.length >0){
   setInterval(() => {
      acts_h.forEach((h) => {
         h.Update(n);
      });
   }, n);
   }else{

      console.log("acts_h length = 0");
   }


   //let a = new noval01_APP();
   //a.start();
}


/*
调用方法  方法名  参数

*/


