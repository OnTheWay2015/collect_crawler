import { BlueNode, NODE_TAG } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//root : "http://www.aoshu.com/tk/aslxt/"
export class BN_Root extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 

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
            let name = "";
            if (gdName.length <= 0) {
                BLUE.error("grade idx[" + i + "] name select none!");
            }
            else {
                name = $(gdName[0]).text();
                BLUE.log("     >>> grade:" + name);
            }
            
            let hrefs = self.selectDom($,$(gd), [
                'p[class="a-point"]',
                'a'
            ]);
            if (hrefs.length <= 0) {
                BLUE.error("grade idx[" + i + "] gdExTypes select hrefs none!");
                continue;
            }
            else {
                for (let i = 0; i < hrefs.length; i++) {
                    let url = $(hrefs[i]).attr("href");
                    url = self.getFullUrl(url);
                    self.addProcessData("grade", i + 1);
                    self.addProcessData("rootName", name);
                    self.pMain.p_nodeMgr.processNode(
                        NODE_TAG.STEP_1,
                        url,
                        {},
                        self.mRootData);
                    //test
                    break;
                }

            }

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

 