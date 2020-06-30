
import { BlueNode, NODE_TAG } from "../collects/node";
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
                let url = $(hrefs[i]).attr("href");
                url = self.getFullUrl(url);
                if(self.isUrlProcess(url) ){
                    continue;
                }
                //self.addProcessData("rootName", name);
                self.addSubNode(
                    NODE_TAG.STEP_4,
                    url,
                    {},
                    self.mRootData);
                //test
                //break;
            }

        }


        let pageUrls= self.selectDom($,$, [
            'div[class="btn-pages"]',
            'a'
        ]);
        if (pageUrls.length <= 0) {
            BLUE.error("BN_ExTypeContent no pages");
        }
        else {
            let urlf = "";
            let l = pageUrls.length;
            for (let i = 0; i < l; i++) {
                let url = $(pageUrls[i]).attr("href");
                if (url.indexOf('_') >0 )
                {
                    urlf = url.slice(0,-7);
                    break;
                }
            }

            if (l > 0 && urlf !="")
            {
                for (let i = 0; i < l; i++) {
                    let url = urlf + i + ".shtml";
                    url = self.getFullUrl(url);

                    if (self.isUrlProcess(url)) {
                        continue;
                    }
                    self.pMain.p_nodeMgr.processNode(
                        NODE_TAG.STEP_2,
                        url,
                        {},
                        self.mRootData);
                    //test
                    //break;

                }
                
            }

        }


    }
}