import * as constants from "../constants";
import { BlueNode} from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';
import * as PATH from 'path';

export class BN_Page extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        
        BLUE.log("BN_Page act");

        let keyFlag = "pageLinkFlag";
        let $ = cheerio.load(data); //采用cheerio模块解析html
        let flag = self.pMain.getGlobalData(keyFlag);
        if ( flag== null || flag <= 0)
        {
            self.pMain.setGlobalData(keyFlag, 1);
            let pages: any = self.selectDom($, $, [
                "div[class='leftpage']",
                "a"
            ]);

            if (pages != null && pages.length > 0) {
                let pcnt =parseInt($(pages[pages.length-1]).text());
                let urlDir = PATH.dirname(self.getUrl());
                let filename:any= $(pages[1]).attr('href');
                //let filename = self.getFileNameFromUrl();
                let idx = filename.lastIndexOf("_");
                let idx1 = filename.lastIndexOf(".");
                let f1 = filename.substr(0, idx + 1);
                let f2 = filename.substr(idx1);
                for (let i=2;i<pcnt;i++) 
                //for (let i=2;i<10;i++)//test
                {
                    let pageUrl = urlDir +"/" + f1 + i +f2; 
                    self.addSubNode(
                        self.tag,//File
                        pageUrl,
                        {},//{ writePath: wpath },
                        self.mRootData);
                }

            } else {
                BLUE.error("no pageslink select")

            }

        } 
        

        $ = cheerio.load(data); //采用cheerio模块解析html
        let divs:any = self.selectDom($,$, [
            "div[class='lista']",
        ]);
        if (divs== null || divs.length<=0){
            BLUE.log($.html());
            BLUE.error("BN_Page no divs select url["+self.getUrl()+"]")
            return;
        }
        let links:any={};
        divs.each( (idx:number,ele:any)=>{
            //let aa = $(ele).filter('a');
            let aa = $(ele).find('a');
            aa.each((aidx:number,a:any)=>{
                let href:any = $(a).attr('href');
                if (href.indexOf("player")>=0)
                {
                    links[href] = 1;
                }
            });
        });
        
        for (let k in links) {
            let url =  self.getFullUrl(k,self.getUrl());
            self.addSubNode(
                constants.NODE_TAG.STEP_5,
                url,
                {},//{ writePath: wpath },
                self.mRootData);
        }

    }
}







