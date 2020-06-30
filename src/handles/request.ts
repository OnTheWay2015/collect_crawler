import * as HTTP from 'http';
import * as HTTPS from 'https';
import * as BLUE from "../utils"
import { NodeManager } from '../manager/nodeManager';
import { main } from '../main';
import * as zlib from 'zlib';

export enum REQ_ERR {
    E_STATUS=1,
}
export class HttpHandle{
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
    private _main!:main;
    constructor(url:string,main:main) {
        let self = this;
        let ust:BLUE.urlST|null = BLUE.transURLSt(url);
        if (ust == null)
        {
            BLUE.error("url["+url+"] transURLSt error!");
        }
        else{
            self._isHttps = ust.isHttps;
            self._port = self._isHttps ? 443 : 80;
            self._host = ust.host;
            self._path = ust.path;
        }
        
        self._main= main;
        self._headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36",
            "Accept":" text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
           "Accept-Encoding": "gzip, deflate",
           //"Accept-Encoding": "identity",
           "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
           //"Connection": "keep-alive",
           "Cache-Control": "max-age=0",
           //"Cookie":"",
           //"Pragma": "no-cache",
        }
        self.mergeHeaders(self._headers, main.p_nodeMgr.getReqHeaders() );
    }
    public getHost():string{
        return this._host;
    }
    public getPath():string{
        return this._path;
    }
    public isHttps():boolean{
        return this._isHttps;
    }
    //注意大小写
    private mergeHeaders(def:any, add:any):void{
        for (let k in add ){
            def[k] = add[k];
        }
    }

    //public setPath(path:string){
    //    this._path = path;
    //}
    //public setHost(host:string){
    //    this._host = host;
    //}

    private isGzip(res:HTTP.IncomingMessage):boolean{
        let headers = res.headers;
        return ((headers["content-encoding"] !=null) && headers["content-encoding"]=="gzip");
    }
    // @res HTTP.IncomingMessage
    public act(cb:(h:string, res:any)=>void, 
        onErr:(err:REQ_ERR,res:any)=>void) {
        let self = this;
        
        let buf:any = null
        
        let body = '';
        // 处理响应的回调函数
        let callback = function (response:HTTP.IncomingMessage) {
            
            //response.setEncoding('utf-8'); //防止中文乱码. 不可乱用.保持原生stream

            // 不断更新数据
            response.on('data', function (data: string) {
                body += data;
                if (buf == null) {
                    buf = Buffer.from(data);
                } else {
                    buf = Buffer.concat([buf, Buffer.from(data)]);
                }
            });

            response.on('end', function () {
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
                    if (self.isGzip(response)) {
                        zlib.gunzip(buf, function (err: any, decoded:any /*Buffer*/ ) {
                            cb(decoded,response);
                            
                            //console.log(decoded.toString());

                            //var fs = require('fs');
                            //fs.open('123.txt', 'w+', function (err: any, fd: any) {
                            //   if (err) {
                            //      console.error(err);
                            //      return;
                            //   }


                               //var iconv = require("iconv-lite");
                               //let x = iconv.decode(decoded,'gb2312');
                               //fs.writeSync(fd, x,0, "utf-8");

                            //   //fs.writeSync(fd, buf, 0, "utf-8");
                            //   
                            //   //fs.writeSync(fd, body,0, "utf-8");
                            //   //fs.writeSync(fd, body,0, "gb2312");
                            //   
                            //    fs.writeSync(fd, decoded,0, "utf-8");
                            //}); 


                        })

                    } else {
                        cb(buf.toString(),response);
                    }
                }
            });
            response.on('error', function (e:any) {
                BLUE.error("request error");
            });

            //let parse = (html) => {
            //    let $ = cheerio.load(html); //采用cheerio模块解析html
            //    //let select = "td[class='headfont12']";
            //    let select = "head";
            //    let s = $(select);
            //    BLUE.log(s);
            //}

        }
        // 向服务端发送请求 todo https
        let req = null;
        let op = {
            host: self._host,
            port: self._port,
            path: self._path,
            method: self._method,
            headers: self._headers
        };

        if (!self._isHttps){
            req = HTTP.request(op, callback);
        }
        else{
            req = HTTPS.request(op, callback);
        }
        req.end();
    }
}