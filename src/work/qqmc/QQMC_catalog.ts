import * as configs from "../../configs";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';

export class QQMC_Catalog extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html


        let els = self.selectDom($, $, [
            "div[id='webPage']",
            "a[class='mpage']"
        ]);
        if (els == null || els.length <=0) {
            BLUE.error("QQMC_Root no Dom element select")
            return;
        }


        let u = "";
        for (var i = 0; i < els.length; i++) {
            //var v = els[i].attribs;

            let url: any = $(els[i]).attr("href");
            if (!url)
            {
                continue;
            }
            u = self.getFullUrl(url, self.getUrl());
        }



        //https://www.qqmc.com/zh/0_rq_shanggan_0_48.htm
        let rpath = PATH.dirname(u); 
        let file = PATH.basename(u); 
        let ext = PATH.extname(file); 

        let idx = file.lastIndexOf("_");
        let pref = file.substring(0, idx+1);
        let cnt = file.substring(idx+1);
        let pages = parseInt(cnt);
        for (let i=pages ;i>0;i--)
        //for (let i=pages ;i>80;i--)
        //for (let i=80;i>60;i--)
        //for (let i=60;i>=0;i--)
        {
            let url = pref + i +  ext;
            url = self.getFullUrl(url,self.getUrl());
            self.addSubNode(
                configs.NODE_TAG.STEP_CATALOG_PAGE,
                url,
                {},
                self.mRootData);
        } 
        
    }
}
 