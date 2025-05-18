import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";

export class ActionStoreSet extends ActionBase {
   
    constructor(pdata:any,localinfo:any,Parent: ActionBase | null, conf: any, holder: any, level: number) {
        super(pdata,localinfo,Parent, conf, holder, level);
    }


    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 1 ){
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }




    }

    protected override Run(): ExecState {
        let self = this;
        let ary = self.m_pAIActionConfig.TargetValue;
        ary.forEach((d)=>{
            if (!Array.isArray(d)){
                self.Errorlog("store_set need array");
                return;
            }
            self.SetDataByKey(d[0], { v: d[1] }); 
        })
        return ExecState.OK;
    }


};
