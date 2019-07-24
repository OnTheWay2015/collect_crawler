import { BlueNode, NODE_TAG } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//step1 : 各年级习题分类
export class BN_GradeExTypes extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html

        let dom = self.selectDom($,$, [
            'p[class="wrapper"]',
            'a',
        ]);
        let name = $(dom[dom.length-1]).text();

        let hrefs = self.selectDom($,$, [
            'div[class="tk-con"]',
            'ul',
            'a',
        ]);

        for (let i = 0; i < hrefs.length; i++) {
            //分类herfs
            let url = $(hrefs[i]).attr("href");

            url = self.getFullUrl(url);
            if (self.isUrlProcess(url)) {
                continue;
            }

            self.pMain.p_nodeMgr.processNode(
                NODE_TAG.STEP_4,
                url,
                {},
                self.mRootData);
            //test
            break;
        }


        hrefs = self.selectDom($,$, [
            'div[class="btn-pages"]',
            'a',
        ]);
        for (let i = 0; i < hrefs.length; i++) {
            let url = $(hrefs[i]).attr("href");
            if (url == null || url == ""){
                continue;
            }
            url = self.getFullUrl(url);
            if (self.isUrlProcess(url)){
                continue;
            }
            self.pMain.p_nodeMgr.processNode(
                NODE_TAG.STEP_2,
                url,
                {},
                self.mRootData);
            //test
            break;
        }

        console.log("111");
    }
}