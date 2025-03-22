
import {APP } from "../app"
import * as M from "../appMain"; 

import { NODE_TAG,HEADER_TAG  } from '../../constants';
import { Page } from './page';
import { Catalog} from './catalog';
import { CatalogPage} from './catalogpage';
import { BN_FileM4A } from '../BN_FileM4A';
import { BlueNodeFile } from "../../collects/node";
import { FilePage } from "./filepage";

export class app_hehe extends M.appMain implements APP {
    constructor() {
        super();
    }
    //private url = "https://yj1.huo1024ji.com/pw/thread.php?fid=3"; //root
    //private url = "https://e1.wkcsncjdbd.club/pw/thread.php?fid=3";
    //private url ="https://e1.7086pp.net/pw/thread.php?fid=3" ;
    private url ="http://z2.2112kt.link/pw/thread.php?fid=3";

	
	//http://q11.bt7086.rocks/pw/
	
	
    //private url="https://bitsdts.xyz/torrent/F824FD424508D909E8EDFCF80CAB4769B3EB3870";    
    private sttag:NODE_TAG = NODE_TAG.ROOT;
    //private sttag:NODE_TAG = NODE_TAG.STEP_FILE_BASE;
    public start(): void {
        let nds = [
           //{ tag: NODE_TAG.ROOT, n: FilePage }//test
            
            { tag: NODE_TAG.ROOT, n: Catalog }
            , { tag: NODE_TAG.STEP_CATALOG_PAGE, n: CatalogPage ,limit:true}
            , { tag: NODE_TAG.STEP_PAGE, n: Page,limit:true}
            , { tag: NODE_TAG.STEP_FILE_PAGE, n: FilePage,limit:true}
            , { tag: NODE_TAG.STEP_FILE_BASE, n: BlueNodeFile,limit:true}
        ];
        let self = this;
        
        self.setDefHeaders(HEADER_TAG.PAGE,{
            "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36", //win
            //"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36", //linux
            "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
           //"Accept-Encoding": "gzip, deflate",
           "Accept-Encoding": "deflate",
           //"Accept-Encoding":"gzip, deflate, br"
           //"Accept-Encoding": "identity",
           "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
           //"Connection": "keep-alive",
           "Cache-Control": "no-cache",
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
