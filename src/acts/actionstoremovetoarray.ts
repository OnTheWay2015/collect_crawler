

import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";
import * as cheerio from 'cheerio';

export class ActionStoreMoveToArray extends ActionBase {
    
    private m_getkey_single: string = "";
    private m_storekey_single: string = "";
    constructor(pdata:any,localinfo:any,Parent: ActionBase | null, conf: any, holder: any, level: number) {
        super(pdata,localinfo,Parent, conf, holder, level);
    }


    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 1 ||
            self.m_pAIActionConfig.TargetValue[0].length < 2) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }

        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        self.m_getkey_single = ary01[0]; //
        self.m_storekey_single = ary01[1]; //

    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetDataByKey(self.m_getkey_single); 
        if (!processdata|| !processdata.v )
        {
            return ExecState.FAILED;
        }
        let k = self.m_storekey_single;
        let sdata = self.GetDataByKey(k);
        let ary = null;
        if (sdata) {
            ary = sdata.v;
        }else{
            ary = []
        }
       
        //利用 instanceof 检测原型链，但需注意跨全局环境（如 iframe）时可能失效
        //if ( processdata.v instanceof Array  ){
        if ( Array.isArray(processdata.v) ){
            ary.push(...processdata.v);
        }else{
            ary.push(processdata.v);
        }
        self.SetDataByKey(self.m_getkey_single,null);//原来的删除
        self.SetDataByKey(k, { v:ary});
        return ExecState.OK;
    }




};
