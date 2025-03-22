
import {APP } from "../app"
import * as M from "../appMain"; 

import { NODE_TAG,HEADER_TAG  } from '../../constants';
import { Page } from './page';
import { Catalog} from './catalog';
import { CatalogPage} from './catalogpage';
import { BN_FileM4A } from '../BN_FileM4A';
import { BlueNodeFile } from "../../collects/node";

export class appWork extends M.appMain implements APP {
    constructor() {
        super();
    }
    private url = "https://www.kekedj.com/music/"; //root
    //private url ="https://play.kekedj.com/20208888/202012/2020120901/%E5%A4%9C%E5%BA%97%E8%BD%A6%E8%BD%BD%E4%B9%8B%E5%A3%B0-%E8%A6%81%E5%90%AC%E5%B0%B1%E5%90%AC%E5%8A%A0%E9%95%BF%E7%89%88%E7%AC%AC%E4%BA%8C%E5%AD%A3-%E8%BF%B7%E5%A4%B1%E5%B9%BB%E5%A2%83-%E7%83%AD%E9%97%A8%E4%B8%AD%E6%96%87%E8%B6%85%E9%95%BF%E4%B8%B2%E7%83%A7%E5%A4%A7%E7%A2%9F.mp3";
 
    //private url = "https://www.kekedj.com/music/130787.html";
    //private url ="https://www.kekedj.com/music-0-0-0-0-0-0-3172.html";// catalog_page
    private sttag:NODE_TAG = NODE_TAG.ROOT;
    //private sttag:NODE_TAG = NODE_TAG.STEP_FILE_BASE;
    public start(): void {
        let nds = [
            //{ tag: NODE_TAG.ROOT, n: CatalogPage }//test
            
            { tag: NODE_TAG.ROOT, n: Catalog }
            , { tag: NODE_TAG.STEP_CATALOG_PAGE, n: CatalogPage }
            , { tag: NODE_TAG.STEP_PAGE, n: Page, ispost:true,limit:true }
            , { tag: NODE_TAG.STEP_FILE_BASE, n: BlueNodeFile,limit:true}
        ];
        let self = this;
        
        self.setDefHeaders(HEADER_TAG.PAGE,{
            "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36", //win
            //"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36", //linux
            "Accept":" text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
           "Accept-Encoding": "gzip, deflate",
           //"Accept-Encoding": "identity",
           "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
           //"Connection": "keep-alive",
           "Cache-Control": "max-age=0",
           //"Cookie":"",
           //"Pragma": "no-cache",
        });
        self.setDefHeaders(HEADER_TAG.AJAX,{
            "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36" //win
            ,"Accept":"*/*" 
            ,"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        });

        self.init(
            () => {
                self.workStart(this.url,this.sttag);
            }
            , false
            , nds
        );
    }

}
