import * as constants from "../constants";
import { BlueNode} from "../collects/node";
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
            let url:any = $(hrefs[i]).attr("href");
            let name  =  $(hrefs[i]).text();
            url = self.getFullUrl(url,self.getUrl());
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
                , constants.DB_BASE
                , constants.DB_COL_EXERCISES
                , [itm]);
            
            //.shtml
            self.addSubNode(
                constants.NODE_TAG.STEP_4,//题目内容hhh
                url,
                { gid:self.mProcessData.gid,kid:self.mProcessData.kid,eid:eid},
                self.mRootData);

            let s = url.replace(".shtml", "_2.shtml");
            BLUE.log("step_5 url["+s+"]");
            self.addSubNode(
                constants.NODE_TAG.STEP_5,//题目答案
                s,
                { gid:self.mProcessData.gid,kid:self.mProcessData.kid,eid:eid},
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
                constants.NODE_TAG.STEP_2,
                url,
                { gid:self.mProcessData.gid,kid:self.mProcessData.kid},
                self.mRootData);
            //test
            break;
        }

    }
}
