import * as configs from "../../configs";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';



export class noval_Root extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        //BLUE.log($.html());


        let els = self.selectDom($, $, [
            'div[id="content"]'
        ]);
        if (els == null || els.length <=0) {
            BLUE.error("noval_Root no Dom element select")
            return;
        }

        let ccc = $(els[0]).text()
            //BLUE.log(ccc);
        let page = self.mRootData.m_page?self.mRootData.m_page:1;
        self.writefile(page,ccc,".txt");

        els = self.selectDom($, $, [
            'div[class="bottem2"]'
            ,'a'
        ]);

        if (els.length <=0){
            BLUE.error("book end")
            return;
        }
        for (let i=0, len = els.length;i<len;i++)
        {
            let element = els[i];
            let str = $(element).text()
            if (str == null || str!= "下一章")
            {
                continue;
            }

            let path = $(element).attr("href");
            let postUrl = self.getWebSit() + path;
            self.addSubNode(
                configs.NODE_TAG.ROOT,
                postUrl,
                {},
                {m_page:page+1});
           break; 
        } 

    }
}
 