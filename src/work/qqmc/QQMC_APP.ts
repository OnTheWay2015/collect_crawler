
import {APP } from "../app"
import * as M from "../appMain"; 

import { NODE_TAG } from '../../configs';
//import { QQMC_Page } from './QQMC_page';
import { QQMC_Root} from './QQMC_root';
//import { QQMC_CatalogPage} from './QQMC_catalogpage';
import { BN_FileM4A } from '../BN_FileM4A';
import { QQMC_M4A } from "./QQMC_M4A";
import { QQMC_CatalogPage } from "./QQMC_catalogpage";
import { QQMC_Catalog } from "./QQMC_catalog";


//https://www.qqmc.com/hot/qiaqia.htm
//
//https://www.qqmc.com/hot/bingsi.htm
//https://www.qqmc.com/hot/0_rq_guangchangwu_0_1.htm

export class QQMC_APP extends M.appMain implements APP {
    constructor() {
        super();
    }
    //private url = "https://www.qqmc.com/zh/0_rq_shanggan_0_48.htm";/伤感 
    //private url = "https://www.qqmc.com/zh/xc_rq_disco_0_51.htm";//disco 
    //https://www.qqmc.com/zh/0_rq_jiubagequ_0_89.htm   //酒巴歌曲
    //https://www.qqmc.com/zh/0_rq_dianyinwang_0_92.htm //电音王


    private url="https://www.qqmc.com";
    private sttag:NODE_TAG = NODE_TAG.ROOT;
    public start(): void {
        let nds = [
            { tag: NODE_TAG.ROOT, n: QQMC_Root }
            , { tag: NODE_TAG.STEP_CATALOG, n:QQMC_Catalog}
            , { tag: NODE_TAG.STEP_CATALOG_PAGE, n:QQMC_CatalogPage}
            , { tag: NODE_TAG.STEP_FILE_M4A, n: QQMC_M4A,limit:true}
        ];
    
        let self = this;
    
        self.init(
            () => {
                self.workStart(this.url,this.sttag);
            }
            , false
            , nds
        );
    }

}
