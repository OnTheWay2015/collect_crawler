import * as configs from "../configs";
import { BlueNode} from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

export class BN_Root extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        let itm = {};
        let grades = self.selectDom($,$, [
            "div[class='header']",
            'ul[class="nav q"]',
            "a"
        ]);
        if (grades== null){
            BLUE.error("no grades select")
            return;
        }
        
        let cnt = 0; 
        for (let i=0, len = grades.length;i<len&& cnt <6;i++)
        {
            let gd = grades[i];
            let url = $(gd).attr("href");
            if (url == null || url.length<=1)
            {
                continue;
            }
            if (url.indexOf('/') != 0)
            {
                continue;
            }
            cnt ++;
            url = self.getFullUrl(url,this.getUrl());
            self.addSubNode(
                configs.NODE_TAG.STEP_1,
                url,
                itm,
                self.mRootData);
            
           //self.addInsertItm( 
           //     self.pMain.p_dbgrades
           //     , configs.DB_BASE 
           //     , configs.DB_COL_GRADES
           //     , itms);
            //test
            //break;
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

 