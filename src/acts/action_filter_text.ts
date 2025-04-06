
import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";
import * as cheerio from 'cheerio';
import { ActionStoreSingle } from "./actionstoresingle";

export class ActionFilterText extends ActionBase {
    
    private m_getkey_single: string = "";
    private m_storekey_single: string = "";
    constructor(Parent: ActionBase | null, conf: any, holder: any, level: number) {
        super(Parent, conf, holder, level);
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

        //if ( !(self.m_pParent instanceof ActionStoreSingle))
        //{
        //    self.Errorlog("need parent ActionStoreSingle");
        //    self.Done(ExecState.FAILED);
        //    return;

        //}
        //todo check parent is  actionstoresingle
    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetParentDataByKey(self.m_getkey_single); 
        let cheerio_eles= processdata.v;
        if (!cheerio_eles|| cheerio_eles.length<=1)//第一个应该是 cheerio $ 
        {
            return ExecState.FAILED;
        }

        let storeinfo:string= "";
        let $ = cheerio_eles[0];
        for (var i = 1; i < cheerio_eles.length; i++) {
            let obj = $(cheerio_eles[i]); 
            storeinfo += obj.text();
        }
        let k = self.m_storekey_single;
        self.SetDataByKey(k, {v:storeinfo} );
        return ExecState.OK;
    }






};
