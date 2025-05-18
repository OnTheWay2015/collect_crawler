

import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";

export class ActionStoreSelect extends ActionBase {
    
    private m_getkey_single: string = "";
    private m_storekey_single: string = "";
    private m_idx:number= -1;
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
        //self.m_store_array = ary01[0];
        self.m_getkey_single = ary01[0]; //
        self.m_storekey_single = ary01[1]; //
        self.m_idx= ary01[2]; //

    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetDataByKey(self.m_getkey_single); 
        if (!processdata|| !processdata.v )
        {
            return ExecState.FAILED;
        }
        let sels = processdata.v;
        let $ = self.GetMarkInfo().$;
        if (sels.length<=0 || self.m_idx >= sels.length )
        {
            BLUE.log($(sels).text());
            return ExecState.FAILED;
        }

        let k = self.m_storekey_single;
        //test
        if (!sels[self.m_idx]){
            let a = 0;
            a++;
        }
        self.SetDataByKey(k, { v: [sels[self.m_idx]] }); //保存时 v 为数组
        return ExecState.OK;
    }






};
