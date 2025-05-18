
import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";

export class ActionStoreSingle extends ActionBase {
    
    private m_getkey_single: string = "";
    private m_storekey_single: string = "";
    private m_DomSelectTags!:string[];
    private m_store_array:boolean = true;
    constructor(pdata:any,localinfo:any,Parent: ActionBase | null, conf: any, holder: any, level: number) {
        super(pdata,localinfo,Parent, conf, holder, level);
    }


    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 2 ||
            self.m_pAIActionConfig.TargetValue[0].length < 2 ||
            self.m_pAIActionConfig.TargetValue[1].length < 1) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }

        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        //self.m_store_array = ary01[0];
        self.m_getkey_single = ary01[0]; //
        self.m_storekey_single = ary01[1]; //

        let ary02 = self.m_pAIActionConfig.TargetValue[1];
        self.m_DomSelectTags = ary02;
    }

    protected override Run(): ExecState {
        let self = this;
        //let processdata = self.GetDataByKey(self.m_getkey_single); 
        //if (!processdata|| !processdata.v )
        //{
        //    return ExecState.FAILED;
        //}
        //let htmlstr = processdata.v;
        //let $ = cheerio.load(htmlstr); //采用cheerio模块解析html
        let $ = self.GetMarkInfo().$;
        let sels = _actions.selectDom($,$,self.m_DomSelectTags);
        if (sels.length<=0)
        {
            BLUE.log($.html());
            return ExecState.FAILED;
        }
        //sels.unshift($);
        //if (self.m_store_array)
        {
            let k = self.m_storekey_single;
            self.SetDataByKey(k, { v:[...sels ] });  //保存时 v 为数组
            //self.m_Holder.SetProcessDataByKey(self.m_storekey_single, sels);
        }
        //else{
        //    self.m_Holder.SetProcessDataByKey( self.m_storekey_single,sel);
        //}
        return ExecState.OK;
    }






};
