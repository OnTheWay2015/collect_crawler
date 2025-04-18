
import * as PATH from 'path';
import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import  * as _actions  from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";
import * as cheerio from 'cheerio';
import { ConfMgr } from '../conf';

export class ActionTravelLinks extends ActionBase {
  
    private m_travellinks:any[]=[];
    private m_travelersStore:ActionBase[]=[];
    private m_getkey_single: string = "";
    private m_setkey: string = "";
    private m_httpactionid:number= 0;
    private m_travelLimitCnt:number= 5;
    private m_travelCnt:number= 0;
    private m_subres:ExecState = ExecState.OK;
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
        self.m_setkey= ary01[1]; //
        self.m_httpactionid = ary01[2]; //
        self.m_travelLimitCnt= ary01[3]; //
        
    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetDataByKey(self.m_getkey_single); 
        if (!processdata|| !processdata.v )
        {
            self.Errorlog("processdata is null");
            return ExecState.FAILED;
        }
        let eles = processdata.v;
        if (!eles || eles.length<1) 
        {
            self.Errorlog("travel links is null");
            return ExecState.FAILED;
        }


        let Conf = ConfMgr.GetActionConfigById(self.m_httpactionid);
        if (Conf == null) {
            self.Errorlog("config travel_links_actionid[" +self.m_httpactionid+ "] is null!");
            return ExecState.FAILED;
        }

        let ele:string = eles[0];
        let prefix = "";
        let dir= "";
        let ust:BLUE.urlST = self.GetMarkInfo();   
        let reg = new RegExp("^http"); //test full url
        if (ust && !reg.test(ele))
        {
            if (ele.indexOf("/") == 0)//绝对路径
            {
                prefix =ust.proto + ust.host;
            }
            else {
                let dir = PATH.dirname(ust.path);
                prefix = ust.host + dir + "/";
            }
        }



        let rs = [
            new RegExp("\\)")  // 注意‌双重转义
            , new RegExp("\\)")
        ]
        let testkey = (k: string) => {
            for (let i=0;i<rs.length;i++)
            {
                if (rs[i].test(k))
                {
                    return false;
                }
            }
            return true;
        }
        eles.forEach((e: string) => {
       
            if (!testkey(e)){
                return;
            }            

            let n = PATH.basename(e)
            if (n.lastIndexOf(".") > 0) {
                n = n.substr(0,n.lastIndexOf("."));
            }
            //dir = PATH.dirname(e);
            //dir = dir.substr(dir.lastIndexOf("/") + 1);
            //dir = dir +"." + n 
        
            self.m_travellinks.push({url:prefix + e } );
        });


        return ExecState.WAITE;
        //return ExecState.OK;
    }

    private _tryStartNewTravel()
    {
        let self = this;
        if ( (self.m_travelersStore.length>=self.m_travelLimitCnt ) ||
            self.m_travellinks.length<=0)
        {
            return;
        }
        
        let info = self.m_travellinks.pop();
        let Conf = ConfMgr.GetActionConfigById(self.m_httpactionid);
        let c = BLUE.deepClone(Conf);
        c.TargetValue[0][1] = info.url;
        //c.TargetValue[0][4] = info.storekey; //对应保存的 href links
        let act = self.Create(c);
        if (act) {
            //act.SetStoreKeyFill(info.store_key_fill);
            act.StartActionConfig();
            //act.SetTmExpire(30000);
            self.m_travelCnt++;
            self.m_travelersStore.push(act);
        }

        //if (self.m_travelersStore.length< self.m_travelLimitCnt)
        //{
        //    self.m_travelLimitCnt = self.m_travelersStore.length;
        //}

    }

    protected override OnSubResult(res:ExecState)
    {
        let self = this;
        if (res == ExecState.FAILED)
        {//只要有一个子节点失败，当前就是失败
            self.m_subres = ExecState.FAILED;
        }

        if (ActionState.WAITING_DRIVER == self.getState() )
        {
            self.m_travelCnt--
            if (self.m_travelCnt <= 0) {
                self.m_travelersStore.length = 0;

                //test
                //self.setExecRes(ExecState.OK);
                //self.GoState(ActionState.CHOISE_TASK)
                return;
            }
        }
        else
        {
            super.OnSubResult(self.m_subres);
        }
    }

    private _Update(tm:number) {
        let self = this;
        self._tryStartNewTravel();
        if (self.m_travelersStore.length <=0 )
        {
            //self.Done(ExecState.OK);
            self.setExecRes(self.m_subres);
            self.GoState(ActionState.CHOISE_TASK)
            return;
        }
        //todo 超时处理, 服务器返回慢时,可能等待很长时间
        self.m_travelersStore.forEach(element => {
            element.Update(tm);
        });
    }

    protected override WaitDriver(tm: number) {
        this._Update(tm);
    }
};
