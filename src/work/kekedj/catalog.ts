import * as configs from "../../configs";
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
        for (let i=1, len = pgst.pagecount;i<=len;i++)
        //for (let i=1, len = pgst.pagecount;i<=2;i++)
        {
            let url = pgst.getUrl(i);
            url = self.getFullUrl(url,self.getUrl());
            self.addSubNode(
                configs.NODE_TAG.STEP_CATALOG_PAGE,
                url,
                itm,
                self.mRootData);
        }
        
    }
}
 