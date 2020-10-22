import * as configs from "../configs";
import { BlueNode} from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

export class BN_PageList extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        data = self.testEncoding(data);
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        //console.log(data.toString());
        let pages = self.selectDom($,$,[
            'tr[class="tr3 t_one"]'
        ]);

        let cnt = 0;
        for (let i = 0; i < pages.length; i++) {
            let pageHref = self.selectDom($, $(pages[i]), [
                'a'
            ]);

            if (pageHref.length<=0){
                continue;
            }
            let pagename = $(pageHref[0]).text();
            let url:any = $(pageHref[0]).attr("href");
            BLUE.notice( "page["+pagename+"] url:["+url+"]" );

            url = self.getFullUrl(url,self.getUrl());
            
            //cnt ++;//test
            //if (cnt >=8)
            //{
            // break;   
            //}
            
            self.addSubNode(
                configs.NODE_TAG.STEP_4,//page
                url,
                {},
                self.mRootData);
        }
    }
}