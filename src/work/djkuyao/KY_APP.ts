
import {APP } from "../app"
import * as M from "../appMain"; 

import { NODE_TAG } from '../../configs';
import { KY_Page } from './KY_page';
import { KY_Root} from './KY_root';
import { KY_Catalog} from './KY_catalog';
import { KY_CatalogPage} from './KY_catalogpage';
import { BN_FileM4A } from '../BN_FileM4A';
import { appWork } from "../kekedj/appWork";

export class KY_APP extends appWork implements APP {
    constructor() {
        super();
    }
    //private url = "https://www.djkuyao.com/dance";//root
    public start(): void {
        let nds = [
            { tag: NODE_TAG.ROOT, n: KY_Root }
            , { tag: NODE_TAG.STEP_CATALOG, n: KY_Catalog }
            , { tag: NODE_TAG.STEP_CATALOG_PAGE, n: KY_CatalogPage }
            , { tag: NODE_TAG.STEP_PAGE, n: KY_Page, limit: true }
            , { tag: NODE_TAG.STEP_FILE_M4A, n: BN_FileM4A }
        ];

        //let m:M.appMain ;
        //m = new M.appMain();
        //m.init(
        //    () => {
        //        m.start(this.url);
        //        //for(let i=0;i<urltest.length;i++)
        //        //{
        //        //   m.test(urltest[i],NODE_TAG.STEP_5);
        //        //}
        //    }
        //    , false
        //    , nds
        //);


    }

}
