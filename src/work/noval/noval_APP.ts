
import {APP } from "../app"
import * as M from "../appMain"; 

import { NODE_TAG,HEADER_TAG,FILE_DIR_ROOT  } from '../../configs';
//import { noval_Page } from './noval_page';
import { noval_Root} from './noval_root';
//import { noval_CatalogPage} from './noval_catalogpage';
import { BN_FileM4A } from '../BN_FileM4A';
import { noval_M4A } from "./noval_M4A";
import { noval_CatalogPage } from "./noval_catalogpage";
import { noval_Catalog } from "./noval_catalog";


import * as HTTP from 'http';
import { REQ_TYPE } from "../../collects/node";
import * as FS from 'fs';

//https://www.qqmc.com/hot/qiaqia.htm
//
//https://www.qqmc.com/hot/bingsi.htm
//https://www.qqmc.com/hot/0_rq_guangchangwu_0_1.htm

export class noval_APP extends M.appMain implements APP {
    constructor() {
        super();
    }


    private packbook():void {
       var files = FS.readdirSync(FILE_DIR_ROOT)
       var wfile = FILE_DIR_ROOT + "/" + "__book.txt";
        for (let i=1;i<=files.length;i++)
        {

            var data = FS.readFileSync(FILE_DIR_ROOT + "/" + i + ".txt")
            FS.appendFileSync(wfile,"第"+ i + "章\r\n")
            FS.appendFileSync(wfile,data.toString())
            FS.appendFileSync(wfile,"\r\n")
        }
    }
    //private url = "https://www.qqmc.com/zh/0_rq_shanggan_0_48.htm";/伤感 
    //private url = "https://www.qqmc.com/zh/xc_rq_disco_0_51.htm";//disco 
    //https://www.qqmc.com/zh/0_rq_jiubagequ_0_89.htm   //酒巴歌曲
    //https://www.qqmc.com/zh/0_rq_dianyinwang_0_92.htm //电音王


    //private url="http://www.b5200.org/76_76215/146897388.html" //第一章
    //private url="http://www.aixiashu.info/21/21709/11343431.html"
    //private url="http://www.aixiashu.info/85/85774/33611653.html"  // 离婚后的我开始转运了 
    private url="http://www.aixiashu.info/109/109533/41816930.html"//招黑体质开局修行在废土 
    //private url="http://www.aixiashu.info/120/120637/45786865.html"  //长生从炼丹宗师开始
    //private url="http://www.aixiashu.info/102/102210/39765914.html";// 红楼之挽天倾
    //private url="http://www.aixiashu.info/113/113491/43047206.html"// 我的金融科技帝国
    //private url="http://www.aixiashu.info/124/124928/47636662.html" // 我一个特技演员疯狂整活很合理吧
    //private url="http://www.aixiashu.info/123/123388/46994966.html" // 苟在诊所练医术 
    private sttag:NODE_TAG = NODE_TAG.ROOT;
    public start(): void {

        
        this.packbook();
        return;

//let data = ""
//let callback = function (res:HTTP.IncomingMessage) {
//    res.on('data', chunk => {
//        data+=chunk;//    });
// 
//    res.on('end', () => {
//        //console.log(JSON.parse(data));
//        console.log(data);
//    });
//}
// 
//HTTP.get(this.url, callback).on('error', err => {
//    console.log('Error: ', err.message);
//});
//
//
//return
        let nds = [
            { tag: NODE_TAG.ROOT, n: noval_Root , reqtype:REQ_TYPE.PUPPETEER}
            //{ tag: NODE_TAG.ROOT, n: noval_Root }
          //  , { tag: NODE_TAG.STEP_CATALOG, n:noval_Catalog}
          //  , { tag: NODE_TAG.STEP_CATALOG_PAGE, n:noval_CatalogPage}
          //  , { tag: NODE_TAG.STEP_FILE_M4A, n: noval_M4A,limit:true}
        ];
    
        let self = this;
        //self.setDefHeaders(HEADER_TAG.PAGE,{
        //    "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36", //win
        //    //"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36", //linux
        //    "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //   "Accept-Encoding": "gzip,deflate",
        //   //"Accept-Encoding": "identity",
        //   //"Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
        //   "Accept-Language":"zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        //   "Upgrade-Insecure-Requests":1,
        //   "Connection": "keep-alive",
        //   //"Cache-Control": "max-age=0",
        //   //"Cookie":"",
        //   //"Pragma": "no-cache",
        //});
        //self.setDefHeaders(HEADER_TAG.AJAX,{
        //    "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36" //win
        //    ,"Accept":"*/*" 
        //    ,"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        //});

    
        self.init(
            () => {
                self.workStart(this.url,this.sttag);
            }
            , false
            , nds
        );
    }

}
