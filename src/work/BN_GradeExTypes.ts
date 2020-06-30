import * as configs from "../configs";
import { BlueNode, NODE_TAG } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//step1 : 各年级习题分类
export class BN_GradeExTypes extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        data = self.testEncoding(data);
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html

        let hrefs = self.selectDom($,$, [
            'div[class="tk-con"]',
            'ul',
            'a',
        ]);

        //题目 list
        for (let i = 0; i < hrefs.length; i++) {
            let url = $(hrefs[i]).attr("href");
            let name  =  $(hrefs[i]).text();
            url = self.getFullUrl(url);
            if (self.isUrlProcess(url)) {
                continue;
            }
            let eid = BLUE.getKindid(name);
            
            BLUE.notice( " exec eid["+eid+"] name["+name+"] url:["+url+"]" );
            
            let itm = {
                gid:this.mProcessData.gid,
                kid:self.mProcessData.kid, 
                eid:eid, 
                desc:name};
            self.addInsertItm(
                self.pMain.p_dbgrades
                , configs.DB_BASE
                , configs.DB_COL_EXERCISES
                , [itm]);

            self.addSubNode(
                NODE_TAG.STEP_4,
                url,
                { gid:self.mProcessData.gid,kid:self.mProcessData.kid},
                self.mRootData);
            //test
            break;
        }


        hrefs = self.selectDom($,$, [
            'div[class="btn-pages"]',
            'a',
        ]);
        //todo auto fix
        for (let i = 0; i < hrefs.length; i++) {
            let url = $(hrefs[i]).attr("href");
            if (url == null || url == ""){
                continue;
            }
            url = self.getFullUrl(url);
            self.addSubNode(
                NODE_TAG.STEP_2,
                url,
                { gid:self.mProcessData.gid,kid:self.mProcessData.kid},
                self.mRootData);
            //test
            break;
        }

    }
}