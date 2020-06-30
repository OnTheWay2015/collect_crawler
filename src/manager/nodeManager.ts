
   import * as BLUE from "./../utils"; 
   import {BlueNode, NODE_TAG} from "../collects/node"; 
   import {ManagerBaseIF}  from "./managerBase"; 
import { ProcessIF } from "./processManager";
import { main } from "../main";
export class NodeManager implements ManagerBaseIF, ProcessIF {
    public tagName: string = "NodeManager";
    //private _nodesMap!:{[key:NODE_TAG]:BlueNode};
    private _nodesMap!:any;
    private _nodesProcess!:Array<BlueNode>;
    private _nodesProcessIng!:Array<BlueNode>;
    private _reqHeaders:any = {};
    public pHolder!:main;
    constructor(holder: main) {
        let self = this;
        self._nodesMap = {};
        self._nodesProcess = [];
        self._nodesProcessIng = [];
        self.pHolder = holder;
    }


    public init(cb?: (res: number) => void) {

    }
    public update(tm: number) {
        BLUE.log("nodemgr update-----------");
        let self =this;
        if (self._nodesProcess.length<=0 && 
            self._nodesProcessIng.length<=0 ) return;
            
        while (self._nodesProcess.length>0 && 
            self._nodesProcessIng.length<5)
        {
            let n:any = self._nodesProcess.shift();
            self._nodesProcessIng.push(n);
        }

        for (let i=0;i<self._nodesProcessIng.length; i++)
        {
            self._nodesProcessIng[i].process(tm);
        } 
        for (let i=self._nodesProcessIng.length-1;i>=0; i--) {
            let n:BlueNode= self._nodesProcessIng[i];
            if (n.complete())
            {
                self._nodesProcessIng.splice(i,1);
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

    public processNode(
        tag: NODE_TAG,
        url:string,
        data?:any,
        rootData?:any ): void {
        let self = this;
        let ncls = self._nodesMap[tag];
        if (ncls == null) {
            BLUE.error("processNode  tag[" + tag + "] error!");
            return;

        }
        let n = new ncls( 
            tag
            ,url
            ,self.pHolder
            //,self.pHolder.p_dbBase//todo  can change, to fit different db ip
            , data
            , rootData);
        
        self._nodesProcess.push(n);
    }

}