import * as configs from "../configs";
import { HttpHandle, REQ_ERR } from "../handles/request";
import { DB_item, DB_handle, DB_CONN, DB_OP } from "../handles/dbHandler";
import { main } from "../main";
import * as BLUE from '../utils';
import * as cheerio from 'cheerio';

import * as FS from 'fs';
import * as PATH from 'path';
import { config } from "process";

export enum URL_MARK{
    PROCESS= 1,
}

//export enum NODE_TAG {
//    ROOT = 1,
//    STEP_1,
//    STEP_10,
//    STEP_2,
//    STEP_3,
//    STEP_4,//page
//    STEP_5,//DownLoadPage
//    STEP_100,//FileImage
//    STEP_200,//FileTorrent
//    STEP_300,//FileM4A
//}

//export enum NODE_TAG {
//    ROOT = "ROOT" ,
//    STEP_1 = "STEP_1",
//    STEP_10 = "STEP_10",
//    STEP_2 = "STEP_2",
//    STEP_3 = "STEP_3",
//    STEP_4 = "STEP_4",//page
//    STEP_5 = "STEP_5",//DownLoadPage
//    STEP_100 = "STEP_100",//FileImage
//    STEP_200 = "STEP_200",//FileTorrent
//    STEP_300 = "STEP_300",//FileM4A
//}


export interface NodeIF{
    pMain:main;
    tag:configs.NODE_TAG;
    process(tm:number):void;
    isComplete():Boolean;
    setComplete(b:Boolean):void;
    //onRequestRes(htmlStr:string):void;
}
enum HtmlEncoding{
    default="utf8", //utf8
    utf8="utf8", //utf8
    gb2312="gb2312",
    gbk="gbk",
}
enum NodeState{
    default=1,
    httpReq,
    onHttpReqOK,
    dbOP,
    dbOPok,
    subNodesOP,
    done,
}


export class BlueNode implements NodeIF {
    public tag!: configs.NODE_TAG;
    protected mProcessData!: any
    protected mRootData!: any
    protected mUrl!: string;
    protected mState!: NodeState;
    protected mComplete!: Boolean;
    protected mRequest!: HttpHandle;
    protected mSubNodes!:Array<any>;
    //protected mItemDB!:DB_item;
    //protected mDBHandle!:DB_handle;
    public pMain!: main;
    protected mitms!:any; //[]   {dbname:, colname:, itms:[]}
    protected dTM!:number;
    protected expireTM!:number;
    protected mRetryCnt!: number;
    constructor(tag: configs.NODE_TAG,
        url: string,
        main: main,
        data?: any, //{headers,}
        rootData?: any) {
        let self = this;
        self.pMain = main;
        self.tag = tag;
        self.mProcessData = data;
        self.mRootData = rootData;
        self.mUrl = url;
        self.mState = NodeState.default;
        self.mRetryCnt = 0;
        //self.mDBHandle = new DB_handle(dbconn);
        
        self.mitms = [];
        self.mSubNodes = [];
        self.addUrlProcessMark(url);
    }

    /**
     <head>
<meta http-equiv="Cache-Control" content="no-transform"/>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312" /> 
     */
    protected testEncoding(htmlbuf:Buffer):Buffer{
        let $ = cheerio.load(htmlbuf); //采用cheerio模块解析html
        let metas = this.selectDom($,$, [
            "meta[http-equiv='Content-Type']"
        ]);
        let s = HtmlEncoding.default;
        for (let i=0, len = metas.length;i<len;i++)
        {
            let m = metas[i];
            //let charset = $(m).find("content");
            let cstring:any= $(m).attr("content");
            if (cstring.length <= 0) {
                continue;
            }
            //let cstring= $(charset[0]).text();
            let startTag = "charset="
            let idx = cstring.indexOf(startTag);
            cstring = cstring.substr(idx + startTag.length );
            let endidx = cstring.indexOf(";"); 
            if (endidx < 0){
                endidx = cstring.indexOf('"'); 
            }
            if (endidx >= 0 ){
                cstring = cstring.substr(0,endidx+1);
            }
            s = <HtmlEncoding>cstring;
            break;
        }

        if (s== HtmlEncoding.gb2312) {
            var iconv = require("iconv-lite");
            htmlbuf = Buffer.from(iconv.decode(htmlbuf, 'gb2312'));//gb2312 转成 utf8
        }
        else if (s== HtmlEncoding.gbk) {
            var iconv = require("iconv-lite");
            htmlbuf = Buffer.from(iconv.decode(htmlbuf, 'gbk'));//gb2312 转成 utf8
        }
        return htmlbuf;
    }
    private retry()
    {
        let self =this;
        self.mRequest.stop();
        self.mState = NodeState.default;
        self.dTM= 0;
        self.mRetryCnt++;
    }

    public process(tm: number): void {
        let self = this;
        if (self.mComplete){
            return;
        }
        self.dTM += tm;
        if ( NodeState.httpReq == self.mState && 
            self.dTM > configs.HTTP_EXPIRE_TM)
        {
            if (self.mRetryCnt >= configs.CFG_HTTP_RETRY_CNT)
            {
                self.setComplete(true);
                BLUE.error("expire tm err! node state[" + self.mState + "] url[" + self.getUrl() + "]");
            }
            else
            {
                self.retry();
            }
            return;
        }
        switch (self.mState) {
            case NodeState.default:
                self.setState(NodeState.httpReq);
                break;
            case NodeState.onHttpReqOK:
                    self.mRequest.stop();
                    self.setState(NodeState.dbOP);
                break;
            case NodeState.dbOPok:
                    self.setState(NodeState.subNodesOP);
                break;
            case NodeState.done:
                self.setComplete(true);
                break;
        }

    }
    protected addProcessData(key: string, v: any, subkey: string = ""): void {
        if (key in this.mProcessData) {
            BLUE.error("addProcessData key[" + key + "] reset!");
        }
        if (subkey == "") {
            this.mProcessData[key] = v;
        } else {
            if (this.mProcessData[key]) {
                this.mProcessData[key][subkey] = v;
            }
            else {
                this.mProcessData[key] = {};
                this.mProcessData[key][subkey] = v;
            }
        }
    }
    public isComplete(): Boolean {
        let self = this;
        return self.mComplete;
    }
    public setComplete(b:Boolean) {
        let self = this;
        self.mComplete = b ;
    }

    protected addSubNode(
        tag: configs.NODE_TAG,
        url:string,
        data?:any, //{addheaders,}
        rootData?:any ): void {
        BLUE.log("AddSubNode tag["+tag+"] url["+url+"]  **FROM**  tag["+this.tag+"] url["+this.getUrl()+"]");
        this.mSubNodes.push({tag:tag,url:url,data:data,rootData:rootData});
    }
    protected setState(s: NodeState): void {
        let self = this;
        self.dTM = 0;
        switch (s) {
            case NodeState.httpReq:
                let headers = 
                self.mRequest = new HttpHandle(self.mUrl, self.pMain,self.mProcessData.headers);
                self.mRequest.act(self._onRequestRes.bind(self),
                    self.onRequestErr.bind(self));
                break;
            case NodeState.dbOP:
                    if (self.mitms && self.mitms.length>0) {
                        self.nextUpdateDB(null,null);
                    }else{
                        s=NodeState.dbOPok;
                    }
                break;
            case NodeState.subNodesOP:
                    if ( self.mSubNodes.length > 0){
                        for(let i=0,j=self.mSubNodes.length;i<j;i++){
                            let v = self.mSubNodes[i];
                            if (this.isUrlProcess(v.url)){
                                continue;
                            }
                            self.pMain.p_nodeMgr.processNode(
                                v.tag,
                                v.url,
                                v.data,
                                v.rootData
                            );
                        }
                    }
                    s = NodeState.done;
                break;
        }
        self.mState = s;
    }

    private nextUpdateDB(err:any, itmsOP:any){
        let self = this;
        let itms:any = self.mitms;
        if (itms.length <=0 ){
            self.onUpdateDBFin();
        }else{
            let v:any = itms[0];
            itms.shift();
            v.DBHandle.insert( 
                v.dbname
                ,v.colname
                ,v.itms
                ,self.nextUpdateDB.bind(self) );
        }
    }

    private onUpdateDBFin(){
        let self =this;
        self.setState( NodeState.dbOPok);
    }
    //todo test more.  eg:  "//" "/"
    protected getFullUrl(u: string,refurl:string=""): string {
        let self = this;
        let url = u;
        url = url.toLocaleLowerCase();
        let regHttps = /^[hH]{1}[tT]{2}[pP]{1}[sS]{1}:\/\//;
        let regHttp = /^[hH]{1}[tT]{2}[pP]{1}:\/\//;
        if (regHttps.test(url) || regHttp.test(url)) {
            return u;
        }


        let regDivD = /^\/\//;
        if (regDivD.test(url) ){
            return self.mRequest.isHttps() ? "https:" + u:"http:" + u;
        }
        let relative = url.indexOf("/") != 0 ;//相对路径
        let rpath = refurl==""? self.mRequest.getHost():PATH.dirname(refurl); 
        if (relative) 
        {
            url = rpath + "/" + u;
        }  
        else
        {
            url = self.getHost() + url;
            url = self.mRequest.isHttps() ?
                "https://" + url : "http://" + url;
        }    
        return url; 
        //let regDivD = /^\/\//;
        //let regDiv = /^\//;
        //if (regDivD.test(url) ){
        //    return self.mRequest.isHttps() ? "https://" + self.mRequest.getHost() + url.slice(1) :
        //                    "http://" + self.mRequest.getHost() +  url.slice(1);
        //}
        //else {
        //    if (regDiv.test(url) ){
        //        url = url.slice(1);
        //    }
        //    return self.mRequest.isHttps() ? "https://" + self.mRequest.getHost() + self.mRequest.getPath() +url :
        //                    "http://" + self.mRequest.getHost() + self.mRequest.getPath() + url;
        //}
    }
    public getUrlori()
    {
        return this.mUrl;
    }
    public getUrl()
    {
        return this.getHttpProtoStr() + this.getHost() + this.getPath();
    }
    protected getPath()
    {
        return this.mRequest?this.mRequest.getPath() : "";

    }
    protected getHost()
    {
        return this.mRequest?this.mRequest.getHost() : "";

    }
    protected getHttpProtoStr()
    {
        return this.mRequest?this.mRequest.getHttpProtoStr() : "";

    }
    protected getFileNameFromUrl(url:string="")
    {
        let self = this;
        url == "" ? url = self.getUrl() : url;
        let idx = url.lastIndexOf("/");
        if (idx < 0)
        {
            BLUE.error("getFileNameFromUrl url["+url+"] find '/' idx["+idx+"] ERR ");
            return "";
        }
        let filename = url.substr(idx+1);
        let idx1 =filename.indexOf("?"); 
        if (idx1 >=0)
        {
            filename = filename.substr(0,idx1);
        }
        filename = decodeURI(filename); 
        
        filename= filename.toLocaleLowerCase();
        return filename;
    }
    //@ res HTTP.IncomingMessage
    protected onRequestRes(htmlstr: string, res: any): void {
    }
    private _onRequestRes(htmlstr: string, res: any): void {
        let self = this;
        if (htmlstr == null)
        {
            self.setState(NodeState.done);
            return;
        }

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

        self.onRequestRes( htmlstr, res);//如有需要,会创建 self.mItemDB
        self.setState(NodeState.onHttpReqOK);
    }
   
    protected initItem(url:string,db:string,collect:string){
        //this.mItemDB = new DB_item(url,{},{dbname:db,colname:collect});
    }

    //
    protected addInsertItm(db:DB_handle, dbname:string, colname:string, itms:any){
        this.mitms.push({DBHandle:db, dbname:dbname,colname:colname,itms:itms, op:DB_OP.insert});
    }
    
    protected addupdateItm(db:DB_handle,dbname:string, colname:string, filter:any, itm:any){
        this.mitms.push({DBHandle:db, dbname:dbname,colname:colname,filter:filter, itm:itm, op:DB_OP.update});
    }


    //protected findAndModify(handle:any,filter:any,itm:any){
    //    if (this.mItemDB==null) return;
    //    this.mItemDB.findAndModify(handle,filter,itm);
    //}
    //@ res HTTP.IncomingMessage
    protected onRequestErr(e:any,res:any ): void {
        let self = this; 
        if (e==-1 || e==-2 )
        {//301,302
            self.setComplete(true);
            BLUE.error("onRequestErr("+e+") err["+res+"] tag["+self.tag+"] url["+self.getUrl()+"]");
            return;
        }
        if (e==-3 )
        {//请求获得的内容长度不对
            //self.setComplete(true);
            BLUE.error("onRequestErr("+e+") err["+res+"] tag["+self.tag+"] url["+self.getUrl()+"]");
            BLUE.log("retry tag["+self.tag+"] url["+self.getUrl()+"]");
            self.retry();
            return;
        }
        let state = res.statusCode;
        BLUE.error("onRequestErr tag["+self.tag+"] http state["+state+"] url["+self.getUrl()+"]");
        if (e == REQ_ERR.E_STATUS){
            switch (state){
                case 301:
                case 302:
                    let lc = res.headers.location;
                    BLUE.error("redirection location["+lc+"]");
                    if (!self.isUrlProcess(lc))
                    {
                        self.pMain.redirection(lc, self.tag);
                    }
                    break;
                default:
                    BLUE.error("onRequestErr todo  tag["+self.tag+"] http state["+state+"]");
            }
        }
        else{
            BLUE.error("onRequestErr todo  tag["+self.tag+"]");
        }
        self.setComplete(true);
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

    private addUrlProcessMark(url: string): void {
        let self = this;
        if (self.mRootData == null) {
            BLUE.error(" addUrlProcessMark but rootData is null!");
            return;
        }
        if (self.mRootData.urlsMark == null)
        {
            self.mRootData.urlsMark = {};
        }
        self.mRootData.urlsMark[url] = URL_MARK.PROCESS;
    }

    public isUrlProcess(url:string):boolean{
        let self = this;
        let marks =  self.mRootData.urlsMark ;
        return marks!= null && marks[url] != null;
    }

    protected setWritePath(path:string)
    {
        if(!path ||path=="")
        {
            BLUE.error("setWritePath ERR");
            return;
        }
        let self=this;
        if (!self.mProcessData) self.mProcessData = {};
        self.mProcessData["writePath"] = path;
    }

    protected writefile(name: string, buf: any, ext: string = "") {
        let self = this;
        let filename = ext != "" ? name + ext : name;
        let wpath = self.mProcessData && self.mProcessData["writePath"] ?
            self.mProcessData["writePath"] : ".";


        if (wpath.indexOf('/') == 0) {
            wpath = configs.FILE_DIR_ROOT + wpath;
        }
        else {
            wpath = configs.FILE_DIR_ROOT + "/" + wpath;
        }

        let r = FS.existsSync(wpath);//检查目录文件是否存在
        if (!r) self.mkdirsSync(wpath);//创建目录

        let wfile = filename;
        if (wfile.indexOf('/') == 0) {
            wfile = wpath + wfile;
        }
        else {
            wfile = wpath + "/" + wfile;
        }
        FS.writeFile(wfile, buf, function (error) {
            if (error) {
                BLUE.log(wfile + '写入失败')
            } else {
                BLUE.log(wfile + '写入成功了')
            }
        })
    }


    // 递归创建目录 同步方法
    protected mkdirsSync(dirname: string) {
        let self = this;
        if (FS.existsSync(dirname)) {
            return true;
        } else {
            if (self.mkdirsSync(PATH.dirname(dirname))) { //path.dirname 返回上层目录; ./aaa/bbb 时返回 ./aaa
                FS.mkdirSync(dirname);
                return true;
            }
        }
    }
}

export class BlueNodeFile extends BlueNode 
{
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        BLUE.log("BlueNodeFile act");
        let filename =this.getFileNameFromUrl();
        self.writefile(filename,data);
    }
}

