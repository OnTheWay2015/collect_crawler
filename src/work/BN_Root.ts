import * as configs from "../configs";
import { BlueNode, NODE_TAG } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//root : "http://www.aoshu.com/tk/aslxt/"
export class BN_Root extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;

        data = self.testEncoding(data);
        //if (cset == HtmlEncoding.gb2312) {
        //    var iconv = require("iconv-lite");
        //    data = iconv.decode(data, 'gb2312');//gb2312 转成 utf8
        //}
        
        super.onRequestRes(data, res); 

        //this.initItem(
        //    configs.DB_IP
        //    ,configs.DB_BASE
        //    ,configs.DB_COL_GRADES );

        //let itm = {name:"ttt", a:"a",b:123};
        let itms:any = []; 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        let grades = self.selectDom($,$, [
            "div[class='borderD']",
            'div[class="tp10"]',
        ]);
        if (grades== null){
            BLUE.error("no grades select")
            return;
        }
        
        let selectGradeName="em"
        for (let i=0, len = grades.length;i<len;i++)
        {
            let gd = grades[i];
            let gdName = $(gd).find(selectGradeName);
            if (gdName.length <= 0) {
                BLUE.error("grade idx[" + i + "] name select none!");
                continue;
            }
            let hrefs = self.selectDom($,$(gdName[0]), [
                'a'
            ]);
            if (hrefs.length <= 0) {
                BLUE.error("grade idx[" + i + "] gdExTypes select hrefs none!");
                continue;
            }

            let href = hrefs[0];
            let name = $(href).text();
            let gid = BLUE.getGradeid(name);
            let itm = { gid: gid, desc: name };
            itms.push(itm);
            BLUE.log("     >>> grade:" + name);
            
            let url = $(href).attr("href");
            url = self.getFullUrl(url);
            BLUE.notice("GRADE[" + gid + "] url:[" + url + "]");
            //self.addProcessData("grade", i + 1);
            //self.addProcessData("rootName", name);
            self.addSubNode(
                NODE_TAG.STEP_10,
                url,
                itm,
                self.mRootData);
            
           self.addInsertItm( 
                self.pMain.p_dbgrades
                , configs.DB_BASE 
                , configs.DB_COL_GRADES
                , itms);
            //test
            break;
        } 
        
    }
}


// cheerio
//var ElementType = require('domelementtype');
//export namespace DomElementType {
//    /***
//     * Text
//     */
//    const Text = "text";


//    /***
//     * <? ... ?>
//     */
//    const Directive = "directive";

//    /***
//     * <!-- ... -->
//     */
//    const Comment = "comment";


//    /***
//     * <script> tags
//     */
//    const Script = "script";


//    /***
//     * <style> tags
//     */
//    const Style = "style";

//    /***
//     * Any tag
//     */
//    const Tag = "tag";

//    /***
//     * <![CDATA[ ... ]]>
//     */
//    const CDATA = "cdata";

//    /***
//     * <!DOCTYPE ... >
//     */
//    const Doctype = "doctype";
//
//    /***
//     * Checks whether element object is a tag
//     */
//

 