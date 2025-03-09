import * as configs from "../../configs";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';

export class noval01_Catalog extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        this.process02(data,res);
    }
    //内容页是 root,并具页面最下面:  （上一章  目录  下一章）
    protected process02(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        //BLUE.log($.html());
        let [chapterEle] = self.selectDom($, $, [
            'div[class="content"]'
        ]);
        if (chapterEle == null ) {
            BLUE.error("noval01_Root no Dom content element select")
            return;
        }



        let [chapterName] = self.selectDom($, chapterEle, [
            'h1[class="wap_none"]'
        ]);
        if (chapterName== null ) {
            BLUE.error("noval01_Root no Dom chapterName element select")
            return;
        }

        let els = self.selectDom($,chapterEle, [
            'div[id="chaptercontent"]'
        ]);
        if (els == null || els.length <=0) {
            BLUE.error("noval01_Root no Dom element select")
            return;
        }

        let ccc = $(els[0]).text()
        ccc =ccc.substring(0,ccc.length - 66) 
            //BLUE.log(ccc);
        let filename = self.mProcessData.filename?self.mProcessData.filename:"__noname";
        self.writefile(filename,ccc,".txt");
    }
}
 