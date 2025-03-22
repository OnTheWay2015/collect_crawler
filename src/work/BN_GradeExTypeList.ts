//class="itemarea clearfix"
import * as constants from "../constants";
import { BlueNode } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//step10 : 分类例表
export class BN_GradeExTypeList extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        data = self.testEncoding(data);
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        //console.log(data.toString());
        let kinds = self.selectDom($,$,[
            'div[class="itemarea clearfix"]'
            , 'div[class="itembox"]'
        ]);

        for (let i = 0; i < kinds.length; i++) {
            //分类herfs

            let kindHref = self.selectDom($, $(kinds[0]), [
                'h3'
                ,'a'
            ]);

            if (kindHref.length<=0){
                continue;
            }
            let kindname = $(kindHref[0]).text();
            let url:any = $(kindHref[0]).attr("href");
            BLUE.notice( "kind["+kindname+"] url:["+url+"]" );

            url = self.getFullUrl(url,self.getUrl());

            let kid = BLUE.getKindid(kindname);
            let itm = {
                gid:this.mProcessData.gid,
                kid:kid,
                desc:kindname };
            self.addInsertItm(
                self.pMain.p_dbgrades
                , constants.DB_BASE
                , constants.DB_COL_KINDS
                , [itm]);

            self.addSubNode(
                constants.NODE_TAG.STEP_1,
                url,
                { gid:self.mProcessData.gid,kid:kid},
                self.mRootData);
            //test
            break;
        }
    }
}