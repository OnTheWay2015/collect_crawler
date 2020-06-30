

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

        if (pageHref.length != 3){
            BLUE.error("BN_ExTypeContect no answer page!" );
            return;
        }
        //todo save Ex content
        let question = self.selectDom($,$,[
            'div[class="content"]'
        ])

        if (question.length > 0) {
            BLUE.error("todo save Ex question content");
            //todo 图片,文字             
            let imgs = self.selectDom($, $(question[0]), [
                'img'
            ])
            if (imgs.length > 0 ){
                for (let i=0, len=imgs.length;i<len;i++){
                    let imgurl= $(imgs[0]).attr("src");
                    self.addImgUrl(imgurl, {nodeProcessData:self.mProcessData}); 
                }
            }


            let answerUrl = $(pageHref[2]).attr("href");
            self.pMain.p_nodeMgr.processNode(
                NODE_TAG.STEP_5,
                answerUrl,
                {},
                self.mRootData);

        } else {
            BLUE.error("no select Ex question content");
        }



         

    }
}