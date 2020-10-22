import * as iconv from 'iconv-lite';

import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as cheerio from 'cheerio';
import * as M from "./main"; 
import * as BLUE from "./utils"; 
import { DB_handle } from './handles/dbHandler';
import { Buffer } from 'buffer';

import * as PUPPETEER from 'puppeteer';
import { NODE_TAG } from './configs';
import { KY_Page } from './work/djkuyao/KY_page';
import { KY_Root} from './work/djkuyao/KY_root';
import { KY_Catalog} from './work/djkuyao/KY_catalog';
import { KY_CatalogPage} from './work/djkuyao/KY_catalogpage';
import { BN_FileM4A } from './work/BN_FileM4A';


module TTT {
   let urltest = [
      "http://www.djye.com/player/1178.htm" 
      ,"http://www.djye.com/player/1177.htm"
      ,"http://www.djye.com/player/1175.htm"
      ,"http://www.djye.com/player/1172.htm"
      ,"http://www.djye.com/player/1171.htm"
      ,"http://www.djye.com/player/1170.htm"
      ,"http://www.djye.com/player/1169.htm"
   ];
   //------------- 
   //let url ="http://www.djye.com";//root
   //let url ="http://www.djye.com/list/xc_0_460.html";//page
   //let url ="http://www.djye.com/player/25473.htm";//download page
   //------------- 
   let url ="https://www.djkuyao.com/dance";//root
   
   //let url ="https://www.djkuyao.com/dance/play-64617.html";//page
   //------------- 
  
let nds = [
      //{tag:NODE_TAG.ROOT, n:KY_Page} //test
      
      {tag:NODE_TAG.ROOT, n:KY_Root}
      ,{tag:NODE_TAG.STEP_CATALOG , n:KY_Catalog}
      ,{tag:NODE_TAG.STEP_CATALOG_PAGE, n:KY_CatalogPage}
      ,{tag:NODE_TAG.STEP_PAGE, n:KY_Page,limit:true}
      ,{tag:NODE_TAG.STEP_FILE_M4A, n:BN_FileM4A}
   ] ;

   let m: M.main;
   m = new M.main();
   m.init(
      () => {
      m.start(url);
      //for(let i=0;i<urltest.length;i++)
      //{
      //   m.test(urltest[i],NODE_TAG.STEP_5);
      //}
   }
   ,false
   ,nds 
);
   
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
}


