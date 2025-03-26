
import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";
import * as cheerio from 'cheerio';
import { ActionStoreSingle } from "./actionstoresingle";

export class ActionStoreFilterTrans extends ActionBase {
    
    private m_getkey_single: string = "";
    private m_storekey_single: string = "";
    private m_trans_kvs!:any[];
    constructor(Parent: ActionBase | null, conf: any, holder: any, level: number) {
        super(Parent, conf, holder, level);
    }

    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 2 ||
            self.m_pAIActionConfig.TargetValue[0].length < 2) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }

        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        self.m_getkey_single = ary01[0]; //
        self.m_storekey_single = ary01[1]; //

        self.m_trans_kvs =  self.m_pAIActionConfig.TargetValue[1];
        //todo check parent is  actionstoresingle
    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetParentDataByKey(self.m_getkey_single); 
        if (!processdata.v)
        {
            return ExecState.FAILED;
        }

        let storeinfo:string= processdata.v;
        self.m_trans_kvs.forEach(element => {
            let r = new RegExp( element[0],"g");
            storeinfo = storeinfo.replace(r,element[1]);
        });
        let k = self.m_storekey_single;
        self.SetDataByKey(k, {v:storeinfo} );
        return ExecState.OK;
    }






};
