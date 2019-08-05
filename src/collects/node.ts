import { HttpHandle, REQ_ERR } from "../handles/request";
import { main } from "../main";
import * as BLUE from '../utils';
import * as cheerio from 'cheerio';

import * as fs from 'fs';

export enum URL_MARK{
    PROCESS= 1, //程序重启后丢失
    MARK_STORE, //标识数据持久化
}

export enum NODE_TAG {
    ROOT = 1,
    STEP_1,
    STEP_2,
    STEP_3,
    STEP_4,
    STEP_5,
}

export interface NodeIF{
    pMain:main;
    tag:NODE_TAG;
    process(tm:number):void;
    complete():Boolean;
    //onRequestRes(htmlStr:string):void;
}
enum NodeState{
    default=1,
    httpReq,
    onHttpReqRes,
    imgReq,
    onImgReqRes,
}


export class BlueNode implements NodeIF {
    public tag!: NODE_TAG;
    protected mProcessData!: any
    protected mRootData!: any
    protected mUrl!: string;
    protected mState!: NodeState;
    protected mComplete!: Boolean;
    protected mRequest!: HttpHandle;
    public pMain!: main;
    constructor(tag: NODE_TAG,
        url: string,
        main: main,
        data?: any,
        rootData?: any) {
        let self = this;
        self.pMain = main;
        self.tag = tag;
        self.mProcessData = data;
        self.mRootData = rootData;
        self.mUrl = url;
        self.mState = NodeState.default;

        self.addUrlProcessMark(url);
    }

    public process(tm: number): void {
        let self = this;
        if (self.mComplete){
            return;
        }
        switch (self.mState) {
            case NodeState.default:
                self.setState(NodeState.httpReq);
                break;
            case NodeState.onHttpReqRes:
                if (self._imgInfos.length > 0) {
                    self.setState(NodeState.imgReq);

                } else {
                    self.mComplete = true;
                }
                break;
            case NodeState.onImgReqRes:
                if (self._imgInfos.length > 0) {
                    self.setState(NodeState.imgReq);

                } else {
                    self.mComplete = true;
                }
                break;
        }
    }


    protected addProcessData(key:string, v:any):void{
        if (key in this.mProcessData)
        {
            BLUE.error("addProcessData key["+key+"] reset!");
        }
        this.mProcessData[key] = v;
    }
    public complete(): Boolean {
        let self = this;
        return self.mComplete;
    }

    protected setState(s: NodeState): void {
        let self = this;
        switch (s) {
            case NodeState.httpReq:
                self.mRequest = new HttpHandle(self.mUrl, self.pMain);
                self.mRequest.act(self.requestRes.bind(self),
                self.onRequestErr.bind(self));
                break;
            case NodeState.imgReq:
                self.mRequest.dispose();
                let v = self._imgInfos.shift();
                self._imgProcess = v;
                self.mRequest = new HttpHandle(v.url, self.pMain);
                self.mRequest.act(self.imgRequestRes.bind(self),
                    self.onRequestErr.bind(self));
                break;
        }
        self.mState = s;
    }

    //todo test more
    protected getFullUrl(url: string): string {
        let self = this;
        url = url.toLocaleLowerCase();
        let regHttps = /^[hH]{1}[tT]{2}[pP]{1}[sS]{1}:\/\//;
        let regHttp = /^[hH]{1}[tT]{2}[pP]{1}:\/\//;
        if (regHttps.test(url) || regHttp.test(url)) {
            return url;
        }

        let regDivD = /^\/\//;
        let regDiv = /^\//;
        if (regDivD.test(url) ){
            return self.mRequest.isHttps() ? "https://" + self.mRequest.getHost() + url.slice(1) :
                            "http://" + self.mRequest.getHost() +  url.slice(1);
        }
        else {
            if (regDiv.test(url) ){
                url = url.slice(1);
            }
            return self.mRequest.isHttps() ? "https://" + self.mRequest.getHost() + self.mRequest.getPath() +url :
                            "http://" + self.mRequest.getHost() + self.mRequest.getPath() + url;
        }
    }

    //@ res HTTP.IncomingMessage
    protected requestRes(htmlstr: string, res: any): void {
        let self = this;

        /*
        节点要处理 res的headers.set-cookie 属性
Set-Cookie: delPer=0; path=/; domain=.baidu.com
Set-Cookie: BDSVRTM=0; path=/
Set-Cookie: BD_HOME=0; path=/
Set-Cookie: H_PS_PSSID=1460_21081_29523_29520_29238_28519_29098_28834_29221_26350_29461; path=/; domain=.baidu.com

        */
        let cookies: any = res.headers["set-cookie"];
        let aa: string = "";
        let ck: string = "";
        if (cookies != null) {
            for (let i = 0, len = cookies.length; i < len; i++) {
                let v = cookies[i];
                let arr = v.split(";");
                ck += arr[0] + ";";
            }
            self.pMain.p_nodeMgr.updateHeaders("Cookie", ck);

        }

        self.onRequestRes(htmlstr, res);
        self.setState(NodeState.onHttpReqRes);
    }
   
    private _imgProcess:any;
    private _imgInfos:any[] = [];
    protected addImgUrl(imgUrl:string, data:any):void{
        let self = this;
        self._imgInfos.push({url:imgUrl, data:data});
    }

    protected imgRequestRes(img:any, res:any):void{
        let self = this;
        self.onImgRequestRes(img, res);
        
        self.setState(NodeState.onImgReqRes);
    }
    protected onImgRequestRes(img: any, res: any): void {
        //to override
        fs.writeFile("/home/blue/ttt.png", img, (err) => {
            if (err) {
                BLUE.error(err.message);
                return;
            }

        });

    }

    protected onRequestRes(htmlstr: string, res: any): void {
        //to override
    }
    //@ res HTTP.IncomingMessage
    protected onRequestErr(tag:REQ_ERR,res:any ): void {
        let self = this; 
        if (tag == REQ_ERR.E_STATUS){
            let state = res.statusCode;
            switch (state){
                case 301:
                case 302:
                    self.pMain.redirection(res.headers.location);
                    break;
                default:
                    BLUE.error("onRequestErr todo  tag["+tag+"] state["+state+"]");
            }
        }
        else{
            BLUE.error("onRequestErr todo  tag["+tag+"]");
        }
    }

    //@  $,采用cheerio模块解析html
    protected selectDom($:any, op:any, sels: string[]): any[] {
        let len = sels.length;
        if (len <= 0) {
            BLUE.error("selectDom error");
            return [];
        }
        let res;
        let idx = 0;

        //是$则把第一个sel选取出来,否则把 op操作对像转为数组
        if ( op.load != null){
            //op === $
            res= op(sels[0]);
            idx = 1;
        }
        else{
            res = [op];
        }

        for (let i = idx; i < len; i++) {
            if (res.length <= 0) {
                BLUE.error("selectDom error on sel[" + sels[i - 1] + "]");
                return [];
            }
            res = $(res[0]).find(sels[i]);
        }
        return res;
    }

    private addUrlProcessMark(url: string, store:boolean=false): void {
        let self = this;
        if (self.mRootData == null) {
            BLUE.error(" addUrlProcessMark but rootData is null!");
            return;
        }
        if (self.mRootData.urlsMark == null)
        {
            self.mRootData.urlsMark = {};
        }
        self.mRootData.urlsMark[url] = store ? URL_MARK.MARK_STORE:URL_MARK.PROCESS;
    }

    public isUrlProcess(url:string):boolean{
        let self = this;
        let marks =  self.mRootData.urlsMark ;
        return marks!= null && marks[url] != null;
    }

}

