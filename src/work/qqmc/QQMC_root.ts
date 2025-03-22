import * as constants from "../../constants";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';

export class QQMC_Root extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html


        let els = self.selectDom($, $, [
            'div[class="w2"]',
            "a",
        ]);
        if (els == null) {
            BLUE.error("QQMC_Root no Dom element select")
            return;
        }


        for (var i = 0; i < els.length; i++) {
            let url: any = $(els[i]).attr("href");
            let s:string = url 
            BLUE.log("top href:" + url)
            //if (s.indexOf("dianyinwang")<0){
            if (s.indexOf("guangchang")<0){
                continue;
            }

            url = self.getFullUrl(url, self.getUrl());
            self.addSubNode(
                constants.NODE_TAG.STEP_CATALOG,
                url,
                {},
                self.mRootData);
        }
    }
}
 