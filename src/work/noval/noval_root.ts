import * as constants from "../../constants";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';



export class noval_Root extends BlueNode{
    //@ res HTTP.IncomingMessage

    protected onRequestRes(data: any,res:any): void {
        this.process02(data,res);
    }


    //内容页是 root,并具页面最下面:  （上一章  目录  下一章）
    protected process02(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        data = self.testEncoding(data);
        let $ = cheerio.load(data); //采用cheerio模块解析html
        //BLUE.log($.html());

        let uri = this.getUrlori();
        let dir = self.getPathSingle(uri);
        let filename = PATH.basename(uri);
        filename = filename.substr(0,filename.indexOf("."));


        let [chapterEle] = self.selectDom($, $, [
            'div[id="zjny"]'
        ]);
        if (chapterEle == null ) {
            BLUE.error("noval_Root no Dom content element select")
            return;
        }



        //let [chapterName] = self.selectDom($, chapterEle, [
        //    'h1[class="wap_none"]'
        //]);
        //if (chapterName== null ) {
        //    BLUE.error("noval_Root no Dom chapterName element select")
        //    return;
        //}

        //let chapterNameStr= $(chapterName).text()

        //let els = self.selectDom($,chapterEle, [
        //    'div[id="chaptercontent"]'
        //]);
        //if (els == null || els.length <=0) {
        //    BLUE.error("noval_Root no Dom element select")
        //    return;
        //}

        let ccc = $(chapterEle).text()
        ccc =ccc.substring(0,ccc.length - 66) 
            //BLUE.log(ccc);
        let page = self.mRootData.m_page?self.mRootData.m_page:1;
        self.writefile(page,ccc,".txt");
        //self.writefile(filename,ccc,".txt");
        //self.writefile(chapterNameStr,ccc,".txt");


        let bottom_btns= self.selectDom($, $, [
            'div[class="bottem2"]'
            ,'a'
        ]);

        if (bottom_btns == null ){
            BLUE.error("book end")
            return;
        }
        for (let i=0, len = bottom_btns.length;i<len;i++)
        {
            let element = bottom_btns[i];
            let str = $(element).text()
            if (str == null || str!= "下一章")
            {
                continue;
            }
            let path = $(element).attr("href");
            let postUrl = self.getWebSit() + path;
            self.addSubNode(
                constants.NODE_TAG.ROOT,
                postUrl,
                {},
                {m_page:page+1});
        } 
    }


    //内容页是 root,并具页面最下面一行有所有章节
    protected process01(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        BLUE.log($.html());


        let els = self.selectDom($, $, [
            'div[id="content"]'
            //'div'
        ]);
        if (els == null || els.length <=0) {
            BLUE.error("noval_Root no Dom element select")
            return;
        }

        let ccc = $(els[0]).text()
            //BLUE.log(ccc);
        let page = self.mRootData.m_page?self.mRootData.m_page:1;
        self.writefile(page,ccc,".txt");

        els = self.selectDom($, $, [
            'div[class="bottem2"]'
            ,'a'
        ]);

        if (els.length <=0){
            BLUE.error("book end")
            return;
        }
        for (let i=0, len = els.length;i<len;i++)
        {
            let element = els[i];
            let str = $(element).text()
            if (str == null || str!= "下一章")
            {
                continue;
            }

            let path = $(element).attr("href");
            let postUrl = self.getWebSit() + path;
            self.addSubNode(
                constants.NODE_TAG.ROOT,
                postUrl,
                {},
                {m_page:page+1});
           break; 
        } 

    }
}
 