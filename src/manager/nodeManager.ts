
   import * as configs from "../configs"; 
    import { NODE_TAG } from "../configs";
   import * as BLUE from "./../utils"; 
   import {BlueNode } from "../collects/node"; 
   import {ManagerBaseIF}  from "./managerBase"; 
import { ProcessIF } from "./processManager";
import { main } from "../main";
export class NodeManager implements ManagerBaseIF, ProcessIF {
    public tagName: string = "NodeManager";
    //private _nodesMap!:{[key:NODE_TAG]:BlueNode};
    private _limitTags!:any;
    private _nodesMap!:any;
    private _nodesProcess!:Array<BlueNode>;
    private _nodesProcessIng!:Array<BlueNode>;
    private _nodesProcessLimit!:Array<BlueNode>;
    private _nodesProcessIngLimit!:Array<BlueNode>;
    private _reqHeaders:any = {};
    public pHolder!:main;
    constructor(holder: main) {
        let self = this;
        self._nodesMap = {};
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
    }
    public _update(tm: number, arrProcess:any,arrProcessIng:any, limit:number) {
        let self =this;
        if (arrProcess.length<=0 && 
            arrProcessIng.length<=0 ) return;
            
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

                BLUE.log("processNode complete! tag[" + n.tag + "] url["+n.getUrl()+"]");
                arrProcessIng.splice(i,1);
            }
        } 
    }

    //---------------------------
    public regNode(tag:NODE_TAG, n:any):void{
        let self =this;
        self._nodesMap[tag] =n; 
    }
   
    public getReqHeaders():any{
        return this._reqHeaders;
    }


    //必须注意大小写 和 默认的写法
    public updateHeaders(key:string,v:string):void{
        this._reqHeaders[key] = v;
    }

    public setLimitNodeTags(obj:any)
    {
        this._limitTags= obj;
    }

    public processNode(
        tag: NODE_TAG,
        url:string,
        data?:any,
        rootData?:any ): void {
        let self = this;
        let ncls = self._nodesMap[tag];
        if (ncls == null) {
            BLUE.error("processNode error! tag[" + tag + "]");
            return;

        }
        let n = new ncls( 
            tag
            ,url
            ,self.pHolder
            //,self.pHolder.p_dbBase//todo  can change, to fit different db ip
            , data
            , rootData);
        
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
