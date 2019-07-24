

import { BlueNode, NODE_TAG } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//step4 :
export class BN_ExContect extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        
        let pageHref= self.selectDom($,$, [
            'div[class="btn-pages"]',
            'a'
        ]);

        if (pageHref.length<= 0){
            BLUE.error("BN_ExTypeContect no answer page!" );
            return;
        }
        //todo save Ex content
        BLUE.error("todo save Ex content");

    }
}