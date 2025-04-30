
import { IReq, REQ_ERR, REQ_TYPE } from "../collects/node";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
import * as BLUE from "../utils"; 
import { BASE_URL } from "./_actions";
import { ActionBase, ActionState, ExecState } from "./actionbase";
import * as cheerio from 'cheerio';

export class ActionHttp extends ActionBase {
    private m_ReqType!: REQ_TYPE;
    private m_Url: string = "";
    private m_Method: string = "GET";
    private m_header: string = "";
    private m_rangflag: boolean = false;
    private m_storekeyhtml: string = "";

    //private m_RetryCnt: number = 0;
    constructor(pdata:any,Parent: ActionBase | null, conf: any, holder: any, level: number) {
        super(pdata,Parent, conf, holder, level);
    }


    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 2 ||
            self.m_pAIActionConfig.TargetValue[0].length < 5 ||
            self.m_pAIActionConfig.TargetValue[1].length < 1) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }

        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        self.m_ReqType = ary01[0]; // normal or puppeteer
        self.m_Url = ary01[1];
        self.m_Method = ary01[2]; //Get | post
        self.m_rangflag = ary01[3]; //断点继传
        self.m_storekeyhtml = ary01[4];//storekey

        //let ust:BLUE.urlST|null = BLUE.transURLSt(self.m_Url);
        //self.m_Holder.SetProcessDataByKey(BASE_URL,ust);

        let ary02 = self.m_pAIActionConfig.TargetValue[1];
        self.m_header = ary02[0];
        
        self.log( "start req==>" + self.m_Url);
        let ust:BLUE.urlST = BLUE.transURLSt(self.m_Url)!;
        let ust_cur = self.GetMarkInfo();
        ust.tag = ust_cur.tag;
        self.SetMarkInfo(ust);
    }

    protected override Run(): ExecState {
        return this._Run(this.m_Url);
    }

    private _Run(url: string): ExecState {
        let self = this;
        //
        let req: any = null;
        let headerobj =self.m_header!="" ?BLUE.ParseJson(self.m_header) :{};


        if (self.m_ReqType == REQ_TYPE.PUPPETEER) {
            req = new PuppeteerHandle(url, null, headerobj, self.m_Method);
        }
        else {
            req = new HttpHandle(url, null, headerobj, self.m_Method);
        }
        //req.setPostData(self.mProcessData.postData);

        req.act(self.cbok.bind(self),
            self.cberr.bind(self), false /*resetflag*/, self.m_rangflag);
        return ExecState.WAITE;
    }


    protected WaitDriverTmExpire()
    {
        let self = this;
        let info = this.GetMarkInfo();
        self.Errorlog( "req==>" + info.url );
        super.WaitDriverTmExpire();
    }

    
    private cbok(htmlstr: string, res: IReq) {
        let self = this;
        let k =  self.m_storekeyhtml;
        //self.SetDataByKey(k, {k:k,v:htmlstr,kinfo:ust} );
        
        
        let $ = cheerio.load(htmlstr); //采用cheerio模块解析html
        self.SetMarkInfo$($);  
        self.SetDataByKey(k, {v:htmlstr} );
        self.setExecRes(ExecState.OK);
        self.GoState(ActionState.CHOISE_TASK);
    }

    private cberr(e: any, res: any) {
        let self = this;
        let state = res.statusCode;
        if (e == REQ_ERR.E_STATUS) {
            switch (state) {
                case 301:
                case 302:
                    let localUrl = res.headers.location;
                    self.Errorlog("actionhttp redirection location[" + localUrl + "]");
                    
                    let ust: BLUE.urlST = BLUE.transURLSt(localUrl)!;
                    let ust_cur = self.GetMarkInfo();
                    ust.tag = ust_cur.tag;
                    self.SetMarkInfo(ust);
                    
                    self._Run(localUrl);
                    return;
                    break;
                default:;
            }
        }
        else {
            self.Errorlog("actionhttp onRequestErr todo  e[" + e + "]");
        }
        self.Errorlog(" http state[" + state + "] onRequestErr(" + e + ") err[" + res + "] url[" + decodeURI(self.m_Url) + "]");
        self.setExecRes(ExecState.FAILED);
        self.GoState(ActionState.TRY_SUB_NODE);
    }

    //private retry() {
    //    let self = this;
    //    if (self.m_RetryCnt >= 3) {
    //        self.setExecRes(ExecState.FAILED);
    //        self.GoState(ActionState.TRY_SUB_NODE);
    //        return;
    //    }
    //    self.m_RetryCnt++;
    //    self.GoState(ActionState.RUN);
    //}


};
