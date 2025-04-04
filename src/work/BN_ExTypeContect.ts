import * as constants from "../constants";
import { BlueNode} from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//step2 : 分类习题例表
export class BN_ExTypeContect extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 

        let $ = cheerio.load(data);
        let hrefs= self.selectDom($,$, [
            'div[class="wrapper tk-list"]',
            'ul',
            'a'
        ]);


        if (hrefs.length <= 0) {
            BLUE.error("!");
        }
        else {
            for (let i = 0; i < hrefs.length; i++) {
                let url:any = $(hrefs[i]).attr("href");
                url = self.getFullUrl(url,self.getUrl());
                //self.addProcessData("rootName", name);
                self.addSubNode(
                    constants.NODE_TAG.STEP_4,
                    url,
                    {},
                    self.mRootData);
                //test
                //break;
            }

        }


        let pages= self.selectDom($,$, [
            'div[class="btn-pages"]',
            'a'
        ]);

    }
}