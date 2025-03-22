
import * as BLUE from "../utils"
import * as zlib from 'zlib';
import { DEBUG_PRINT_PAGE_CONTENT } from '../constants';

import * as FS from 'fs';
import { BlueNode, IReq,REQ_ERR } from '../collects/node';


import * as PUPPETEER from 'puppeteer';
import * as PATH from 'path';

var PuppeteerBrower:any=null 
export class PuppeteerHandle implements IReq{

    private _isHttps:boolean = false;
    private _url:string= "";
    private _host:string = "";
    private _path:string = "";
    private _port:number= 80;
    private _method:string= BLUE.GET;

    private _headers:any = {};
    private _main!:any;
    private mReq!:any; 
    constructor(url:string,main:any,headers:any,method:string=BLUE.GET) {
        let self = this;
        self._url = url;
        let ust:BLUE.urlST|null = BLUE.transURLSt(url);
        if (ust == null)
        {
            BLUE.error("url["+url+"] transURLSt error!");
        }
        else{
            self._isHttps = ust.isHttps;
            self._port = ust.port>0 ? ust.port : (self._isHttps ? 443 : 80);
            self._host = ust.host;
            self._path = ust.path;
        }
       
        self._method = method;
        self._main= main;
        self.mergeHeaders(self._headers, main.p_nodeMgr.getReqHeaders(), headers);
    }

    public getSetCookies():any 
    {
        return null;
    }
    public debugPrintHeaders()
    {
        BLUE.log(JSON.stringify(this._headers));   
    }
    public getHost():string{
        return this._host;
    }
    public getPath():string{
        return this._path;
    }
    public getHttpProtoStr():string{
        return this.isHttps()? "https://" : "http://";
    }
    public isHttps():boolean{
        return this._isHttps;
    }
    //注意大小写
    private mergeHeaders(def:any, globaladd:any, add:any):void{
        if (globaladd) {
            BLUE.mergeObject(def, globaladd);
        }
        if (add) {
            BLUE.mergeObject(def, add);
        }
    }

    // @res HTTP.IncomingMessage
    private _buf:any;
    private _contentLength:number = 0;
    private _range_etag:string = "";
    private _range_last_md:string = "";
    public act(cb:(h:string, res:any)=>void, 
        onErr:(err:REQ_ERR,res:any)=>void,reset:boolean=false,setRange:boolean=false) {
            let self = this
    
      PUPPETEER.defaultArgs({
         headless:true, //是否无头模式
      })


      let _func = async ()=>
{

    if (!PuppeteerBrower) {
        PuppeteerBrower = await PUPPETEER.launch();
    }

    // 获取page实例
    const page = await PuppeteerBrower.newPage();

    // 将webdriver字段删除，防止反爬虫
    await page.evaluateOnNewDocument(() => {
        let a:any = navigator
        const newProto = a.__proto__;
        delete newProto.webdriver;
        a.__proto__ = newProto;
    })
    // 设置useragent，如果headless设置为true，则必做
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.564.41');
    
    //await page.setViewport({ width: 1080, height: 720 });
    await page.goto(self._url);

    //await page.waitFor(15000);
    //  await page.screenshot({
    //     path:"./test_after.png"
    //     ,type:"png"
    //  });

    //let h: any = await page.$("html");
    //BLUE.log(h.innerText); 
    //BLUE.log(h.innerHTML);
    //let html = await h.evaluate((node: any) => node.innerHTML);
    //BLUE.log(html);
    
    //FS.writeFileSync(PATH.join("./", "exportHtml.html"), html);

    let content = await page.content();
    //BLUE.log(content);
    //FS.writeFileSync(PATH.join("./", "exportHtmlcontent.txt"), content);
    await page.close();
    cb(content,this);
}

_func()
    
    }
    private _postData:any; 
    public setPostData(v:any)
    {
        this._postData = v;
    }
    public stop()
    {
    }
    public getBufLength()
    {
        return 1;
        //return this._buf ? this._buf.length : 0;
    }
}
