import * as constants from "../../constants";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';

export class KY_Root extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        console.log($.html());
        let itm = {};
        let els = self.selectDom($,$, [
            'div[class="list_tr"]',
            "a"
        ]);
        if (els== null || els.length<=0){
            BLUE.error("no Dom element select")
            return;
        }
        
        for (let i=0, len = els.length;i<len;i++)
        {
            let element = els[i];
            let url = $(element).attr("href");
            if (url == null || url.length<=1)
            {
                continue;
            }
            //if (url.indexOf('/') != 0)
            //{
            //    continue;
            //}
            url = self.getFullUrl(url,self.getUrl());
            self.addSubNode(
                constants.NODE_TAG.STEP_CATALOG,
                url,
                itm,
                self.mRootData);
        } 
        
    }
}
 