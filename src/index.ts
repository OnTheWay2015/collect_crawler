`process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';`
import * as iconv from 'iconv-lite';

import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as cheerio from 'cheerio';
import * as BLUE from "./utils"; 
import { Buffer } from 'buffer';


import * as PUPPETEER from 'puppeteer';
import * as FS from 'fs';
import * as PATH from 'path';

import { app_hehe } from './work/hehe/app_hehe';
import { QQMC_APP } from './work/qqmc/QQMC_APP';
//import { KY_APP } from './work/djkuyao/KY_APP';
//import { appWork } from './work/kekedj/appWork';

module TTT {
   //------------- 
   //let url ="http://www.djye.com";//root
   //let url ="http://www.djye.com/list/xc_0_460.html";//page
   //let url ="http://www.djye.com/player/25473.htm";//download page
   //------------- 
   //let url ="https://www.djkuyao.com/dance";//root
   let url ="https://www.baidu.com"
   
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

      await page.setViewport({width:1080,height:720});
      await page.goto(url);


      //await page.waitForSelector('ul.gl-warp>li'); //等待选择器要选的元素,复杂选择器
      //await page.waitForSelector('#s_btn_wr>#su'); //

//
      await page.screenshot({
         path:"./test.png"
         ,type:"png"
      });

      
      await page.waitFor(15000);

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

      await page.waitFor(15000);
      await page.screenshot({
         path:"./test_after.png"
         ,type:"png"
      });


      await page.close();
      await brower.close();




   };

   //test
   test_view ();


   //work
   //let a =new KY_APP();
   //let a =new appWork();
   //let a =new app_hehe();
   
   
   //let a =new QQMC_APP();
   //a.start();
}


