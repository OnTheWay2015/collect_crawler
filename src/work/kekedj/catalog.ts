import * as constants from "../../constants";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';

export class Catalog extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;

        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        let itm = {};
        let els = self.selectDom($,$, [
            'div[class="page_new"]'
            ,'li[class="number"]'
            ,'a'
        ]);
        if (els.length <=0){
            BLUE.error("no Dom element select")
            return;
        }

        let pgst:BLUE.pages_st = BLUE.getPagesST(els,$,"-");
        if (!pgst)
        {
            BLUE.error("catalog["+self.getUrl()+"] no pages!")
            return;
        }
        //for (let i=1, len = pgst.pagecount;i<=len;i++)
        //for (let i=7, len = pgst.pagecount;i<=len;i++)
        //for (let i=300, len = pgst.pagecount;i<600;i++)
        //for (let i=800, len = pgst.pagecount;i<900;i++)
        //for (let i=1000, len = pgst.pagecount;i<1100;i++)
        //for (let i=1200, len = pgst.pagecount;i<1300;i++)
        //for (let i=1300, len = pgst.pagecount;i<1400;i++)
        //for (let i=1700, len = pgst.pagecount;i<1900;i++)
        //for (let i=1900, len = pgst.pagecount;i<2200;i++)
        //for (let i=2400, len = pgst.pagecount;i<2500;i++)
        //for (let i=2500, len = pgst.pagecount;i<3000;i++)
        for (let i=3500, len = pgst.pagecount;i<3600;i++)
        {
            //let url = "https://www.kekedj.com/music/list-0-0-7-0-131-0-0.html";
            let url = pgst.getUrl(i);
            url = self.getFullUrl(url,self.getUrl());
            self.addSubNode(
                constants.NODE_TAG.STEP_CATALOG_PAGE,
                url,
                itm,
                self.mRootData);
        }
        
    }
}
 