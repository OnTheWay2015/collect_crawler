import * as iconv from 'iconv-lite';

import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as cheerio from 'cheerio';
import * as BLUE from "./utils"; 
import { Buffer } from 'buffer';

import * as PUPPETEER from 'puppeteer';
//import { KY_APP } from './work/djkuyao/KY_APP';
import { appWork } from './work/kekedj/appWork';

module TTT {
   //------------- 
   //let url ="http://www.djye.com";//root
   //let url ="http://www.djye.com/list/xc_0_460.html";//page
   //let url ="http://www.djye.com/player/25473.htm";//download page
   //------------- 
   let url ="https://www.djkuyao.com/dance";//root
   
   //let url ="https://www.djkuyao.com/dance/play-64617.html";//page
   //------------- 
  
    let test_view = async ()=>{
      const brower = await PUPPETEER.launch();
      const page = await brower.newPage();

      await page.setViewport({width:1080,height:720});
      await page.goto(url);

      await page.screenshot({
         path:"./test.png"
         ,type:"png"
      });
      await page.waitFor(25000);

      let h: any = await page.$("html");
      //BLUE.log(h.innerText); 
      //BLUE.log(h.innerHTML);
      let html = await h.evaluate((node: any) => node.innerHTML);
      BLUE.log(html);

      let content = await page.content();
      BLUE.log(content);

      await page.close();
      await brower.close();

      //let id = setInterval(async () => {
      //   let h: any = await page.$("html");
      //   //BLUE.log(h.innerText); 
      //   //BLUE.log(h.innerHTML);
      //   let html = await h.evaluate((node: any) => node.innerHTML);
      //   BLUE.log(html);
      //   
      //   let content = await page.content();
      //   BLUE.log(content);

      //   await page.close();
      //   await brower.close();
      //   clearInterval(id); 
      //}, 5000);

   };

   //test_view ();


   //let a =new KY_APP();
   let a =new appWork();
   a.start();
}


