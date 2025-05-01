
import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";
import * as cheerio from 'cheerio';
import { ActionStoreSingle } from "./actionstoresingle";

export class ActionStoreTextMatch extends ActionBase {
    
    private m_getkey_single: string = "";
    private m_storekey_single: string = "";
    private m_filter_key:string="";
    private m_ismatch:boolean=true;
    constructor(pdata:any,Parent: ActionBase | null, conf: any, holder: any, level: number) {
        super(pdata,Parent, conf, holder, level);
    }

    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 1 ||
            self.m_pAIActionConfig.TargetValue[0].length < 4) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }

        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        self.m_getkey_single = ary01[0]; //
        self.m_storekey_single = ary01[1]; //
        self.m_filter_key= ary01[2]; //
        self.m_ismatch= ary01[3]; //
    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetDataByKey(self.m_getkey_single); 
        let cheerio_eles= processdata.v;
        if (!cheerio_eles|| cheerio_eles.length<=0)
        {
            return ExecState.FAILED;
        }
        //let baseurl= self.m_Holder.GetProcessDataByKey(_actions.BASE_URL);
        let storeinfo:any[]= [];
        let $ = self.GetMarkInfo().$;
        for (var i = 0; i < cheerio_eles.length; i++) {
            let obj = $(cheerio_eles[i]); 
            let r = new RegExp(self.m_filter_key);
            let text = obj.text();
           
            /*
            //注意 填写配置时,从网页上复制对应的字符,这样编码一致
            console.log(encodeURIComponent(text)); // 显示编码差异:ml-citation{ref="1,5" data="citationList"}
            console.log(encodeURIComponent(self.m_filter_key));

            const normalized1 = text.normalize('NFC');
            const normalized2 = self.m_filter_key.normalize('NFC');
            if (normalized1 == normalized2 ){
                let aaa = 0;
                aaa++;
            }
            if (self.m_filter_key === text){
                let aaa = 0;
                aaa++;
            }
            */
            let b = r.test(text);
            if ( (self.m_ismatch && b) || 
            ( !self.m_ismatch && !b))
            {
                storeinfo.push(cheerio_eles[i]);
            }
        }
        if (storeinfo.length<=0){
            return ExecState.FAILED;
        }
        let k = self.m_storekey_single;
        self.SetDataByKey(k, {v:storeinfo} );
        return ExecState.OK;
    }






};
