
import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";

export class ActionHttpFailedStore extends ActionBase {
    
    private m_storekey_single: string = "";
    constructor(pdata:any,localinfo:any,Parent: ActionBase | null, conf: any, holder: any, level: number) {
        super(pdata,localinfo,Parent, conf, holder, level);
    }

    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 1 ||
            self.m_pAIActionConfig.TargetValue[0].length < 1) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }

        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        self.m_storekey_single = ary01[0]; //
    }

    protected override Run(): ExecState {
        let self = this;
        let markinfo = self.GetMarkInfo();
        if (!markinfo )
        {
            return ExecState.FAILED;
        }


        let processdata = self.GetDataByKey(self.m_storekey_single); 
        if (!processdata)
        {
            processdata = {v:[]};
            self.SetDataByKey(self.m_storekey_single, processdata );
        }
        BLUE.log( "Failed url =>["+markinfo.url+"]")
        processdata.v.push(markinfo.url); 

        return ExecState.OK;
    }






};
