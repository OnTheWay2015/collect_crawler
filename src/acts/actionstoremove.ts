
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";
import * as cheerio from 'cheerio';

export class ActionStoreMove extends ActionBase {
    
    private m_getkey_single: string = "";
    private m_storekey_single: string = "";
    private m_append: boolean=false; 
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
        self.m_append = ary01[2]; //

    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetDataByKey(self.m_getkey_single); 
        if (!processdata|| !processdata.v )
        {
            return ExecState.FAILED;
        }
        let k = self.m_storekey_single;
        let content = processdata.v;
        if (self.m_append){
            let sdata = self.GetDataByKey(k); 
            if (sdata && sdata.v) {
                content = sdata.v + content;
                self.SetDataByKey(k,null);//原来的删除
            }
        }
        self.SetDataByKey(self.m_getkey_single,null);//原来的删除
       
        //todo 保存 v 为数组
        self.SetDataByKey(k, { v:content});
        return ExecState.OK;
    }




};
