import * as configs from "../configs";
import { HttpHandle } from "../handles/request";
import { PuppeteerHandle } from "../handles/request_by_puppeteer";
//import { DB_item, DB_handle, DB_CONN, DB_OP } from "../handles/dbHandler";
import * as BLUE from '../utils';
import * as cheerio from 'cheerio';

import * as FS from 'fs';
import * as PATH from 'path';
import { config } from "process";

//import ax from "axios"

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
    pMain:any;//appmain
    tag:configs.NODE_TAG;
    process(tm:number):void;
    isComplete():Boolean;
    setComplete(b: Boolean): void;
    debugString(): string;
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


export enum REQ_ERR {
    E_STATUS=1,
    E_1=1001,
    E_2=1002,
    E_3=1003,
    E_4=1004,
    E_5=1005,
    E_6=1006,
    E_7=1007,
}


export enum REQ_TYPE {
    NORMAL =1,
    PUPPETEER = 2, 
}
export interface IReq {
    setPostData(v:any):void
    stop():void
    act(cb: (h: string, res:IReq) => void,
        onErr: (err: REQ_ERR, res:IReq) => void, reset: boolean, setRange: boolean): void
    isHttps(): boolean
    getPath(): string
    getHost(): string
    getHttpProtoStr(): string

    getBufLength(): number
    getSetCookies():any 

    }

export class BlueNode implements NodeIF {
    public tag!: configs.NODE_TAG;
    public mReqType!:REQ_TYPE;
    protected mProcessData!: any
    protected mRootData!: any
    protected mUrl!: string;
    protected mState!: NodeState;
    protected mComplete!: Boolean;
    protected mRequest!: IReq|null;
    protected mSubNodes!:Array<any>;
    //protected mItemDB!:DB_item;
    //protected mDBHandle!:DB_handle;
    public pMain!: any;
    protected mitms!:any; //[]   {dbname:, colname:, itms:[]}
    protected dTM!:number;
    protected expireTM!:number;
    protected mRetryCnt!: number;

    private _method:string= BLUE.GET;
    constructor(tag: configs.NODE_TAG,
        url: string,
        main: any,
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
        self.mReqType=  REQ_TYPE.NORMAL;
        //self.mDBHandle = new DB_handle(dbconn);
       
        self.mitms = [];
        self.mSubNodes = [];
        self.addUrlProcessMark(url);
        self.init();
        self.expireTM = this.getExpireTm();
    }
    public setReqType(t:REQ_TYPE )
    {
        this.mReqType=  t;
    }
    private init(): void {
        this.onInit();
    }
    //to be override
    protected onInit(): void {
    }
    protected setExpireTm(v:number)
    {
        this.expireTM = v;
    }
    protected getExpireTm()
    {
        return this.expireTM > 0 ? this.expireTM : configs.HTTP_EXPIRE_TM;
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
    private _resetflag:boolean = false;
    private retry(reset:boolean=true)
    {
        let self =this;
        self.mState = NodeState.default;
        self.dTM= 0;
        self.mRetryCnt++;
        //BLUE.error("retry tag["+self.tag+"] buf_length["+ (self.mRequest? self.mRequest.getBufLength() : 0 )+"] url["+decodeURI(self.getUrl())+"] reset["+reset+"]");
        console.log(self.mRequest); 
        if (reset)
        {
            self._resetflag = reset;
            if (self.mRequest) self.mRequest.stop();
            self.mRequest = null ;
        }
    }

    public process(tm: number): void {
        let self = this;
        if (self.mComplete){
            return;
        }
        self.dTM += tm;
        if ( NodeState.httpReq == self.mState && 
            self.dTM > self.expireTM )
        {
            if (self.mRetryCnt >= configs.CFG_HTTP_RETRY_CNT)
            {
                self.setComplete(true);
                BLUE.error("expire tm err! node state[" + self.mState + "] url[" + self.getUrl() + "]");
            }
            else
            {
                //BLUE.error("retry on tmexpire   tag["+self.tag+"] url["+ decodeURI(self.getUrl())+"]");
                self.retry(true);
            }
            return;
        }
        switch (self.mState) {
            case NodeState.default:
                self.setState(NodeState.httpReq);
                break;
            case NodeState.onHttpReqOK:
                    if (self.mRequest) self.mRequest.stop();
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
    public debugString(): string
    {
        //let self = this;
        //let bufstr = self.mRequest ? self.mRequest.getBufLength() : 0;
        //let datastr = self.mProcessData? JSON.stringify(self.mProcessData) : "";
        //return "tag["+self.tag+"] state["+self.mState+"] url["+ decodeURI(self.getUrl())+"] buf_length["+bufstr+"] processData["+datastr+"]" ;
        return "";
    }
    
    protected addSubNode(
        tag: configs.NODE_TAG,
        url:string,
        data?:any, //{addheaders,}
        rootData?:any ): void {
        BLUE.log("AddSubNode tag["+tag+"] url["+url+"]  **FROM**  tag["+this.tag+"] url["+this.getUrl()+"]");
        
        if (url== undefined)
        {
            BLUE.error("addSubNode url undefined! tag[" + tag + "]  url["+this.getUrl()+"]");
            return;
        }
        
        this.mSubNodes.push({tag:tag,url:url,data:data,rootData:rootData});
    }

    private _useDefHeader:any;
    public setHttpHeader(h:any): void {
        this._useDefHeader= h;
    }
    public setHttpMethod(m:string ): void {
        this._method = m;
    }
    public debugPrintHeaders()
    {
        //if (this.mRequest)
        //{
        //    this.mRequest.debugPrintHeaders();
        //    if (this.mProcessData.postData) {
        //        BLUE.log(JSON.stringify(this.mProcessData.postData));   
        //    }
        //}
        //else
        //{
        //    BLUE.error("error: node request not created! ");
        //}
    }
    protected setState(s: NodeState): void {
        let self = this;
        self.dTM = 0;
        switch (s) {
            case NodeState.httpReq:
                let h = self._useDefHeader;
                if (self.mProcessData.headers) {
                    h = BLUE.mergeObject(h, self.mProcessData.headers);
                }
                if (self.mRequest)
                {

                }
                else
                {
                    if (self.mReqType == REQ_TYPE.PUPPETEER)
                    {
                        self.mRequest = new PuppeteerHandle(self.mUrl, self.pMain, h, self._method);
                    }
                    else
                    {
                        self.mRequest = new HttpHandle(self.mUrl, self.pMain, h, self._method);
                    }
                }
                if (self.mProcessData.postData) {
                    self.mRequest.setPostData(self.mProcessData.postData);
                }
                self.mRequest.act(self._onRequestRes.bind(self),
                    self.onRequestErr.bind(self),self._resetflag, self.rangflag());
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
                            if (this.isUrlProcess(v.url,v.tag)){
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
    private rangflag()
    {
        return false;
        //return this.tag == configs.NODE_TAG.STEP_FILE_BASE || this.tag == configs.NODE_TAG.STEP_FILE_M4A;
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

        let mreq:any = self.mRequest ? self.mRequest : null;
        let regDivD = /^\/\//;
        if (regDivD.test(url) ){
            return mreq.isHttps() ? "https:" + u:"http:" + u;
        }
        let relative = url.indexOf("/") != 0 ;//相对路径
        let rpath = refurl==""? mreq.getHost():PATH.dirname(refurl); 
        if (relative) 
        {
            url = rpath + "/" + u;
        }  
        else
        {
            url = self.getHost() + url;
            url = mreq.isHttps() ?
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
    protected getPathSingle(url:string)
    {
        let str = PATH.dirname(url); 
        str = str.substr(str.indexOf("//")+2);
        str = str.substr(str.indexOf("/")+1);
        
        //let h = this.getHost();
        //h = h.substr(h.indexOf(".")+1);
        //let i = str.indexOf(h);
        //str = str.substr(i+h.length);
        return str;
    }
    protected getWebSit()
    {
        if (this.mRequest&& this.mRequest.isHttps())
        {
            return  "https://" +this.getHost() ;
        }
        return  "http://" +this.getHost() ;
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
    private _onRequestRes(htmlstr: string, res: IReq): void {
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

//getSetCookies
        let cookies: any = res.getSetCookies();// res.headers["set-cookie"];
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
    protected addInsertItm(db:any /*DB_handle*/, dbname:string, colname:string, itms:any){
        this.mitms.push({DBHandle:db, dbname:dbname,colname:colname,itms:itms, op:"DB_OP.insert"});
    }
    
    protected addupdateItm(db:any /*DB_handle */,dbname:string, colname:string, filter:any, itm:any){
        this.mitms.push({DBHandle:db, dbname:dbname,colname:colname,filter:filter, itm:itm, op:"DB_OP.update"});
    }


    //protected findAndModify(handle:any,filter:any,itm:any){
    //    if (this.mItemDB==null) return;
    //    this.mItemDB.findAndModify(handle,filter,itm);
    //}
    //@ res HTTP.IncomingMessage
    protected onRequestErr(e:any,res:any ): void {
        let self = this; 
        BLUE.error("onRequestErr mProcessData:" + JSON.stringify(self.mProcessData));
        if (e==-1)
        {//connect error
            BLUE.error("onRequestErr("+e+") err["+res+"] tag["+self.tag+"] url["+ decodeURI(self.getUrl())+"]");
            //BLUE.error("retry tag["+self.tag+"] url["+decodeURI(self.getUrl())+"]");
            self.retry();
            return ;
        }
        if (e==-2)
        {//other unknow error
            //read ECONNRESET
            //socket hang up
            //self.setComplete(true); //会触发这个错误时，也可能触发了 e=-3 
            
            BLUE.error("onRequestErr("+e+") err["+res+"] tag["+self.tag+"] url["+decodeURI(self.getUrl())+"]");
            let r = self.mRequest ? self.mRequest.getBufLength() > 0 :  false;
            self.retry( !r );
            return;
        }
        if (e==-3 )
        {//请求获得的内容长度不对
            //self.setComplete(true);
            BLUE.error("onRequestErr("+e+") err["+res+"] tag["+self.tag+"] url["+decodeURI(self.getUrl())+"]");
            //BLUE.error("retry tag["+self.tag+"] url["+decodeURI(self.getUrl())+"]");
            //self.retry(false);
            return;
        }
        if (e==-4)
        {//request json error
            self.setComplete(true);
            BLUE.error("onRequestErr("+e+") err["+res+"] tag["+self.tag+"] url["+decodeURI(self.getUrl())+"]");
            return;
        }
        if (e==-6)
        {//request 206 //断点续传下载 
            BLUE.error("onRequestErr("+e+") err["+res+"] tag["+self.tag+"] url["+decodeURI(self.getUrl())+"]");
            self.retry( false );
            return;
        }
        if (e==-7)
        {//request 请求结束,内容总长度不对 
            BLUE.error("onRequestErr("+e+") err["+res+"] tag["+self.tag+"] url["+decodeURI(self.getUrl())+"]");
            self.retry( true );
            return;
        }
        let state = res.statusCode;
        BLUE.error("onRequestErr tag["+self.tag+"] http state["+state+"] url["+decodeURI(self.getUrl())+"]");
        if (e == REQ_ERR.E_STATUS){
            switch (state){
                case 301:
                case 302:
                    let lc = res.headers.location;
                    BLUE.error("redirection location["+lc+"]");
                    if (!self.isUrlProcess(lc,self.tag))
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

        let res_ary = [res];
        for (let i = idx; i < len; i++) {
            if (res_ary.length <= 0) {
                BLUE.error("selectDom error on sel[" + sels[i - 1] + "]");
                return [];
            }
            res_ary = this.findhandle($,res_ary,sels[i]);
        }
        return res_ary.length ==1 ? res_ary[0] : res_ary;
    }
    private findhandle($:any,res_ary:any,sel_key:string)
    {
        let new_res_ary = [];
        for (let j = 0; j < res_ary.length; j++) {
            let res = res_ary[j];
            for (let k = 0; k < res.length; k++) {
                let r = $(res[k]).find(sel_key);
                if (r.length > 0) {
                    new_res_ary.push(r);
                }
            }
        }
        return new_res_ary;
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

    public isUrlProcess(url:string,tag:string=""):boolean{
        let self = this;
        let clsinfo = self.pMain.p_nodeMgr.getNodeInfo(tag);
        if (clsinfo && clsinfo.ispost)
        {
            return false;
        }

        let marks =  self.mRootData.urlsMark ;
        let res = marks!= null && marks[url] != null;
        if (res)
        {
            BLUE.error(" Url is Process ["+url+"]");
        }
        return res;
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
            self.mProcessData["writePath"] : "";
            //self.mProcessData["writePath"] : ".";


        if (wpath.indexOf('/') == 0) {
            wpath = configs.FILE_DIR_ROOT + wpath;
        }
        else {
            if (wpath.length > 0)
            {
                wpath = configs.FILE_DIR_ROOT + "/" + wpath;
            }
            else
            {
                wpath = configs.FILE_DIR_ROOT;
            }
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
        });
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

    //protected AX()
    //{
    //    return ax;
    //}
}

export class BlueNodeFile extends BlueNode 
{
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        if (data.indexOf("<html")>=0)
        {
            return;
        }
        super.onRequestRes(data, res); 
        BLUE.log("BlueNodeFile act");
        let pdata = self.mProcessData;
        let filename = pdata.name? pdata.name : this.getFileNameFromUrl();
        let ext = ""; 
        if (pdata.fileExt)
        {
            ext = pdata.fileExt;
        } 
        
        self.writefile(filename,data,ext);
    }

    protected onInit(): void {
        super.onInit();
        this.setExpireTm( configs.FILE_EXPIRE_TM );
    }
}



