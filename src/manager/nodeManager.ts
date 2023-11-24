
   import * as configs from "../configs"; 
    import { NODE_TAG } from "../configs";
   import * as BLUE from "./../utils"; 
   import {BlueNode } from "../collects/node"; 
   import {ManagerBaseIF}  from "./managerBase"; 
import { ProcessIF } from "./processManager";
export class NodeManager implements ManagerBaseIF, ProcessIF {
    public tagName: string = "NodeManager";
    //private _nodesMap!:{[key:NODE_TAG]:BlueNode};
    private _limitTags!:any;
    private _nodesMap!:any;
    private _nodeInfos!:any;
    private _nodesProcess!:Array<BlueNode>;
    private _nodesProcessIng!:Array<BlueNode>;
    private _nodesProcessLimit!:Array<BlueNode>;
    private _nodesProcessIngLimit!:Array<BlueNode>;
    private _reqHeaders:any = {};
    public pHolder!:any;//appmain
    constructor(holder: any) {
        let self = this;
        self._nodesMap = {};
        self._nodeInfos= {};
        self._nodesProcess = [];
        self._nodesProcessIng = [];
        self._nodesProcessLimit = [];
        self._nodesProcessIngLimit = [];
        self.pHolder = holder;
    }


    public init(cb?: (res: number) => void) {

    }
    public update(tm: number) {
        this._update(tm, this._nodesProcess,this._nodesProcessIng, configs.CFG_NODE_PROCESS_CNT);
        this._update(tm, this._nodesProcessLimit,this._nodesProcessIngLimit,configs.CFG_NODE_PROCESS_LIMIT_CNT );
        this.dumpProcessNodes(tm);
    }

    private _checkdumptm = 0;
    private dumpProcessNodes(tm:number)
    {
        let self = this;
        self._checkdumptm += tm;
        if (self._checkdumptm < 3*60 * 1000)
        {
            return;
        }
        self._checkdumptm = 0;
        let f = (ary: any) => {
            for (let i = 0; i <ary.length;i++) {
                let n = ary[i];
                BLUE.error(" node ["+n.debugString()+"] ");
            }
        }
        BLUE.error(" ##################### process  normal ##############################");
        f(self._nodesProcessIng);
        BLUE.error(" ##################### process  limit ##############################");
        f(self._nodesProcessIngLimit);
    }


    private _checkendtm:number = 0;
    public _update(tm: number, arrProcess:any,arrProcessIng:any, limit:number) {
        let self =this;
        if (arrProcess.length<=0 && 
            arrProcessIng.length<=0 ) 
           {
               self._checkendtm+=tm;
               let sec = 30
                if(self._checkendtm > 1000*sec)
                {
                    self._checkendtm = 0;
                    BLUE.log("node process empty ["+sec+"] seconds !");
                }
                return;
           } 
        self._checkendtm = 0;

        while (arrProcess.length>0 && 
            arrProcessIng.length<limit)
        {
            let n:any = arrProcess.shift();
            BLUE.log("processNode act ProcessIng! tag[" + n.tag + "] oriUrl["+n.getUrlori()+"] ");
            arrProcessIng.push(n);
        }

        for (let i=0;i<arrProcessIng.length; i++)
        {
            arrProcessIng[i].process(tm);
        } 
        for (let i=arrProcessIng.length-1;i>=0; i--) {
            let n:BlueNode= arrProcessIng[i];
            if (n.isComplete())
            {

                BLUE.log("processNode complete! tag[" + n.tag + "] url["+decodeURI( n.getUrl())+"]");
                arrProcessIng.splice(i,1);
            }
        } 
    }

    //---------------------------
    public regNode(tag:NODE_TAG, n:any):void{
        let self =this;
        self._nodesMap[tag] =n; 
    }
    public regNodes(arr:{tag:string,n:any}[]):void{
        let self =this;
        for (let i=0;i<arr.length;i++)
        {
            let v:any = arr[i];
            self._nodesMap[v.tag] =v.n; 
            self._nodeInfos[v.tag] =v; 
            if (v.limit)
            {
                self.setLimitNodeTag(v.tag,v.limit);
            }
        }
    }
    public getNodeInfo(tag:string)
    {
        return this._nodeInfos[tag]; 
    }
    public getReqHeaders():any{
        return this._reqHeaders;
    }


    //必须注意大小写 和 默认的写法, 当前是同步cookie
    public updateHeaders(key:string,v:string):void{
        this._reqHeaders[key] = v;
    }

    public setLimitNodeTags(obj:any)
    {
        this._limitTags= obj;
    }
    public setLimitNodeTag(tag:NODE_TAG, v:boolean)
    {
        let self = this;
        if (!self._limitTags) {
            self._limitTags = {};
        }
        self._limitTags[tag] = v;
    }

    public processNode(
        tag: NODE_TAG,
        url:string,
        data?:any,
        rootData?:any ): void {
        let self = this;
        let ncls = self._nodesMap[tag];
        if (ncls == null) {
            BLUE.error("processNode error! tag[" + tag + "] not registered");
            return;

        }
        if (url== undefined)
        {
            BLUE.error("processNode error! tag[" + tag + "] url undefined");
            return;
        }
        let n:BlueNode= new ncls( 
            tag
            ,url
            ,self.pHolder
            //,self.pHolder.p_dbBase//todo  can change, to fit different db ip
            , data
            , rootData);
        
            let clsinfo =self._nodeInfos[tag]; 
        if (clsinfo.reqtype){
            n.setReqType(clsinfo.reqtype)
        }
        if (clsinfo.ispost)
        {
            n.setHttpMethod(BLUE.POST);
            n.setHttpHeader(self.pHolder.getDefHeaders(configs.HEADER_TAG.AJAX));
        }
        else
        {
            n.setHttpHeader(self.pHolder.getDefHeaders(configs.HEADER_TAG.PAGE));
        }

        BLUE.log("processNode add ok! tag[" + tag + "] url["+url+"] ");
        if (self._limitTags && self._limitTags[tag])
        {
            //self._nodesProcessLimit.push(n);
            self._nodesProcessLimit.unshift(n);
        }
        else
        {
            //self._nodesProcess.push(n);
            self._nodesProcess.unshift(n);
        }
    }

}
