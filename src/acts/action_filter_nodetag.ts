
import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";
import * as cheerio from 'cheerio';
import { ActionStoreSingle } from "./actionstoresingle";

export class ActionFilterNodeTag extends ActionBase {
    
    private m_getkey_single: string = "";
    private m_storekey_single: string = "";
    private m_filter_key:string="";
    constructor(pdata:any,localinfo:any,Parent: ActionBase | null, conf: any, holder: any, level: number) {
        super(pdata,localinfo,Parent, conf, holder, level);
    }

    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 1 ||
            self.m_pAIActionConfig.TargetValue[0].length < 3) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }

        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        self.m_getkey_single = ary01[0]; //
        self.m_storekey_single = ary01[1]; //
        self.m_filter_key= ary01[2]; //

        //if ( !(self.m_pParent instanceof ActionStoreSingle))
        //{
        //    self.Errorlog("need parent ActionStoreSingle");
        //    self.Done(ExecState.FAILED);
        //    return;

        //}
    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetDataByKey(self.m_getkey_single); 
        let cheerio_eles= processdata.v;
        if (!cheerio_eles|| cheerio_eles.length<=0)
        {
            return ExecState.FAILED;
        }
        let storeinfo:any = [];
        let $ = self.GetMarkInfo().$ 
        for (var i = 0; i < cheerio_eles.length; i++) {
            let obj = $(cheerio_eles[i]); 
            let eles = obj.find(self.m_filter_key);  // 再次 cheerio 筛选
            if (eles.length > 0 ){
                storeinfo.push(... eles);
            }
        }
        let k = self.m_storekey_single;
        self.SetDataByKey(k, {v:storeinfo} );
        return ExecState.OK;
    }






};
