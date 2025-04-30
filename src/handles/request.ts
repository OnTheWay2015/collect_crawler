import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as BLUE from "../utils"
import { NodeManager } from '../manager/nodeManager';
import * as zlib from 'zlib';
import { DEBUG_PRINT_PAGE_CONTENT } from '../constants';

import * as FS from 'fs';
import { BlueNode, IReq,REQ_ERR } from '../collects/node';

var querystring = require('querystring');
 

export class HttpHandle implements IReq{
    //private _options = {
    //    host: 'www.baidu.com',
    //    port: '80',
    //    path: '/',
    //    method: 'GET',
    //    headers: {
    //    }
    // };

    private _isHttps:boolean = false;
    private _host:string = "";
    private _path:string = "";
    private _port:number= 80;
    private _method:string= BLUE.GET;

    private _headers:any = {};
    private _main!:any;
    private mReq!:any; 
    private mResponse!: HTTP.IncomingMessage
    constructor(url:string,main:any,headers:any,method:string=BLUE.GET) {
        let self = this;
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
        //self._headers = headers;
        //self._main= main;
        self._headers = {
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            //"Accept":" text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept":"*/*",
           //"Accept-Encoding": "gzip, deflate",
           //"Accept-Encoding": "gzip, deflate, br, zstd", //todo zstd
           "Accept-Encoding": "gzip, deflate, br",
           //"Accept-Encoding": "identity",
           //"Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
           //"Accept-Language": "zh-CN,zh;q=0.9",
           "Connection": "keep-alive",
           //"Cache-Control": "no-cache",

           //"Cookie":"",
           //"Pragma": "no-cache",
        }

        //self.mergeHeaders(self._headers, main.p_nodeMgr.getReqHeaders(), headers);
    }
    public getSetCookies():any 
    {
        if (!this.mResponse)
        {
            return null
        }
        return this.mResponse.headers["set-cookie"];
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

    //public setPath(path:string){
    //    this._path = path;
    //}
    //public setHost(host:string){
    //    this._host = host;
    //}
    private isJson(res:HTTP.IncomingMessage)
    {
        let headers = res.headers;
        let key ="content-type";
        let value="application/json";
        return ((headers[key] !=null) && headers[key]==value);

    }
    private isBrotli(res:HTTP.IncomingMessage):boolean{
        //let headers = res.headers;
        //return ((headers["content-encoding"] !=null) && headers["content-encoding"]=="gzip");
        
        let headers = res.headers;
        let key ="content-encoding";
        let value="br";
        return ((headers[key] !=null) && headers[key]==value);
    }
    private isGzip(res:HTTP.IncomingMessage):boolean{
        //let headers = res.headers;
        //return ((headers["content-encoding"] !=null) && headers["content-encoding"]=="gzip");
        
        let headers = res.headers;
        let key ="content-encoding";
        let value="gzip";
        return ((headers[key] !=null) && headers[key]==value);
    }
    // @res HTTP.IncomingMessage
    private _buf:any;
    private _contentLength:number = 0;
    private _range_etag:string = "";
    private _range_last_md:string = "";
    public act(cb:(h:string, res:any)=>void, 
        onErr:(err:REQ_ERR,res:any)=>void,reset:boolean=false,setRange:boolean=false) {
        let self = this;
        if (reset || !setRange)
        {
            self._buf = null;
            self._contentLength = 0;
            self._range_last_md= "";
            self._range_etag= "";
        }

        //let body = '';
        // 处理响应的回调函数
        let callback = function (response:HTTP.IncomingMessage) {
            self.mResponse = response 
            //response.setEncoding('utf-8'); //防止中文乱码. 不可乱用.保持原生stream
            let headers = response.headers;
            
            //BLUE.error('response headers ====>' + JSON.stringify(headers,null,4));
            
            if(headers["content-length"] && self._contentLength <= 0 )
            {
                self._contentLength = parseInt(headers["content-length"]);
            }
            //if (headers["last-modified"])
            //{
            //    self._range_last_md = headers["last-modified"];
            //}
            //if (headers["etag"])
            //{
            //    let etag = headers["etag"] ;//Array.isArray(a)
            //    self._range_etag = Array.isArray(etag) ? etag[0] : etag;
            //}

            // 不断更新数据
            response.on('data', function (data: string) {
                //body += data;
                //if (!self._buf) {
                //    self._buf = Buffer.from(data);
                //} else {
                    self._buf = Buffer.concat([self._buf, Buffer.from(data)]);
                //}
            });

            //https://blog.csdn.net/thewindkee/article/details/80189434
            response.on('end', function () {
                if (setRange) 
                {
                    if (response.statusCode == 206 )
                    {//断点续传, 没这个是不支持断点下载
                        onErr(REQ_ERR.E_6, "contentLength[" + self._contentLength + "] recv len[" + self._buf.length + "]  ");
                        return ;
                    }
                    else if (self._buf.length != self._contentLength)
                    {//长度不对
                        onErr(REQ_ERR.E_7, "contentLength[" + self._contentLength + "] recv len[" + self._buf.length + "]  ");
                        return ;
                    }

                }
                if (response.statusCode == 403){
                        //forbidden 
                        onErr(REQ_ERR.E_8, "request forbidden!");
                        return ;
                }
                if (response.statusCode == 301 ||
                    response.statusCode == 302) {
/**
        301 redirect: 301 代表永久性转移(Permanently Moved)
        302 redirect: 302 代表暂时性转移(Temporarily Moved )

        详细来说，301和302状态码都表示重定向，就是说浏览器在拿到服务器返回的这个状态码后会自动跳转到一个新的URL地址，
        这个地址可以从响应的Location首部中获取（用户看到的效果就是他输入的地址A瞬间变成了另一个地址B）——这是它们的共同点。
        他们的不同在于:301表示旧地址A的资源已经被永久地移除了（这个资源不可访问了），搜索引擎在抓取新内容的同时也将旧的网址交换为重定向之后的网址；
        302表示旧地址A的资源还在（仍然可以访问），这个重定向只是临时地从旧地址A跳转到地址B，搜索引擎会抓取新的内容而保存旧的网址。 
 * 
 */
                    onErr(REQ_ERR.E_STATUS, response);
                }
                else {
                    // 数据接收完成
                    //BLUE.log(" print html ------------------------");
                    //BLUE.log(body);
                    //parse(body);

                    //let zlib = require('zlib');
                    //zlib.gunzip(buf, function (err:any, decoded:any) {
                    //   console.log(decoded.toString());
                    //    fs.writeSync(fd, decoded,0, "utf-8");
                    //})

                    if (self._contentLength > 0 && self._buf.length != self._contentLength )
                    {
                        onErr(REQ_ERR.E_3, "contentLength["+self._contentLength+"] recv len["+self._buf.length+"]  ");
                        return;
                    }
                    let htmlstr = self._buf;
                    let afterZipcb= (r:HTTP.IncomingMessage,hstr:string)=>{
                            if (self.isJson(r))
                            {
                                try
                                {
                                    htmlstr = JSON.parse(hstr);
                                }
                                catch (e)
                                {
                                    onErr(REQ_ERR.E_4, "request json error");
                                    return;
                                }
                            }
                            cb(htmlstr,self);
                            return; 
                    };
                    //isBrotli
                    if (self.isGzip(response)) {
                        if (DEBUG_PRINT_PAGE_CONTENT) BLUE.log("gzip page download!");
                        zlib.gunzip(self._buf, function (err: any, decoded:any /*Buffer*/ ) {
                            if (err != null)
                            {
                                BLUE.error( "request zlib err: " + err.message);
                            }
                            htmlstr = decoded.toString();
                            afterZipcb(response, htmlstr);
                            //if (DEBUG_PRINT_PAGE_CONTENT) BLUE.log(htmlstr);
                            //if (DEBUG_PRINT_PAGE_CONTENT) 
                            //{
                            //    let wfile = "ttttest.html"
                            //    FS.writeFile(wfile, htmlstr, function (error) {
                            //        if (error) {
                            //            BLUE.log(wfile + '写入失败')
                            //        } else {
                            //            BLUE.log(wfile + '写入成功了')
                            //        }
                            //    });

                            //}
                            
                        })
                    } 
                    else if (self.isBrotli(response))
                    {
                        zlib.brotliDecompress(self._buf, function (err: any, decoded:any /*Buffer*/ ) {
                            if (err != null)
                            {
                                BLUE.error( "request zlib err: " + err.message);
                            }
                            htmlstr = decoded.toString();
                            afterZipcb(response, htmlstr);
                        });
                    }
                    else
                    {
                        afterZipcb(response, htmlstr);
                    }
                }
            });
            response.on('error', function (e:any) {
                BLUE.error("request error");
                onErr(REQ_ERR.E_5,"request error" );
            });
        }
        
        //断点下载
        let h = self._headers;  
        if (setRange)
        {
            if (self._buf == null)
            {
                self._buf =Buffer.from("");// Buffer.alloc([]);
            }
//-----------------
//Accept-Ranges: bytes
//Content-Range: bytes 0-2000/4932    //从0开始
//Content-Length: 2001          //起始闭区间,终止是闭区间?


//https://blog.csdn.net/thewindkee/article/details/80189434
//https://www.cnblogs.com/1995hxt/p/5692050.html
//Range: bytes=10- ：第10个字节及最后个字节的数据
//Range: bytes=40-100 ：第40个字节到第100个字节之间的数据.
//-----------------
            //res.setHeader("Accept-Ranges", "bytes");
            //res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
            let start = self._buf.length;
            let r = {
                    "Range": "bytes "+start+"-"+""+"/" + self._contentLength
                };
            //let r = {
            //    //"Range": "bytes 0-5000" 
            //    "Range": "bytes 0-" 
            //};
            //h["Connection"] ="keep-alive";
            h = BLUE.mergeObject(h,r);
            //if (self._range_etag)
            //{
            //    h["if-range"] = self._range_etag;
            //}
            //if (!h["if-range"] && self._range_last_md)
            //{
            //    h["if-range"] = self._range_last_md;
            //}

/*
当（中断之后）重新开始请求更多资源片段的时候，必须确保自从上一个片段被接收之后该资源没有进行过修改。
The If-Range 请求首部可以用来生成条件式范围请求：

假如条件满足的话，条件请求就会生效，服务器会返回状态码为 206 Partial 的响应，以及相应的消息主体
假如条件未能得到满足，那么就会返回状态码为 200 OK 的响应，同时返回整个资源。该首部可以与 Last-Modified 验证器或者 ETag 一起使用，但是二者不能同时使用
If-Range: Wed, 21 Oct 2015 07:28:00 GMT 

*/


        }         
        else {
            //self._buf =new Buffer([]);
            self._buf =Buffer.from("");// Buffer.alloc([]);
        }
        let req = null;
        let op = {
            host: self._host,
            port: self._port,
            path: self._path,
            method: self._method,
            rejectUnauthorized: false, // 关闭SSL验证
            headers: h
        };

        /**
         报错: Error: getaddrinfo ENOTFOUND http:
            at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:64:26)

            说明是 host错了,查不出对应的ip
         */

        if (!self._isHttps){
            req = HTTP.request(op, callback);
        }
        else{
            req = HTTPS.request(op, callback);//https.js  new ClientRequest(...args)
        }
        let hhhh:any = req.getHeaders();
        //BLUE.error('HTTP.request headers ====>\n' + JSON.stringify(hhhh,null,4));//pretty-print
        //console.log('HTTP.request headers ====>\n');
        //console.dir(JSON.stringify(hhhh,null,4));//pretty-print

        req.on('connect', (res, socket, head) => {
            socket.on('error', (e:any) => {
                BLUE.error('HTTP.request  connect ====>' + e.message);
                onErr(REQ_ERR.E_1, e.message);
            })
        }).on('error', function (e: any) {
            BLUE.error('HTTP.request error ====>' + e.message)
            onErr(REQ_ERR.E_2, e.message);
        });
        if (self._postData)
        {
            let contents = querystring.stringify(self._postData);
            req.write(contents);
        }

        self.mReq = req; 
        req.end();

    }
    private _postData:any; 
    public setPostData(v:any)
    {
        this._postData = v;
//var contents = querystring.stringify({
//    name:'byvoid',
//    email:'byvoid@byvoid.com',
//    address:'Zijing'
//});
    }
    public stop()
    {
        this.mReq.cb = null;
        this.mReq.destroy();
    }
    public getBufLength()
    {
        return this._buf ? this._buf.length : 0;
    }
}
