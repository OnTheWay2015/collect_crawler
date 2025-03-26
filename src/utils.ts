import { BlueNode } from "./collects/node";
import { LOG_ERROR, LOG_NOTICE, LOG_WARING } from "./constants";
import * as FS from 'fs';
import * as PATH from 'path';

export const GET:string="get";
export const POST:string="post";

export function log(str:string){
    if (LOG_NOTICE) console.log(str);
}
export function notice(str:string){
    if (LOG_WARING) console.log(str);
}
export function error(str:string){
    //let e = Error();
    //console.log(e.stack);
    if (LOG_ERROR) console.error(str);
}


export function mergeObject(to: any, from: any): void {
    let str = JSON.stringify(to)
    let toobj:any = ParseJson(str); 
    for (let k in from) {
        toobj[k] = from[k];
    }
    return toobj;

}

export function ParseJson(str: string): any {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e: any) {
        error("ParseJson err:" + e.message);
        return null;
    }
}

export function JsonToStr(j: any): string {
    return JSON.stringify(j);
}


//--------------------------------
export class urlST{
    public isHttps:boolean = false;
    public host:string= "";
    public proto:string= "http://";
    public path:string= "/";
    public port:number= 0;
    public auto_name:string= "";
    public url:string= "";
}

export function transURLSt(u: string): urlST | null {
    let url = u.toLocaleLowerCase();
    let idx1 = url.lastIndexOf(":");
    let url_seg = url.substr(idx1+1,url.length);
    let idx2 = url_seg.indexOf("/");
    if (idx2>=0)
    {
        url_seg=url_seg.substr(0,idx2) ; 
    }

    let regHttps = /^[hH]{1}[tT]{2}[pP]{1}[sS]{1}:\/\//;
    let regHttp = /^[hH]{1}[tT]{2}[pP]{1}:\/\//;
    let ret = new urlST();
    ret.url = url;
    if (url_seg.length>0)
    {
        ret.port =parseInt(url_seg);
    }
    if (regHttps.test(url)) {
        ret.isHttps = true;
        ret.proto = "https://";
        url = url.slice(8);
        //log("https act!");
    }
    else if (regHttp.test(url)) {
        url = url.slice(7);
        //log("http act!");
    }
    else {
        error("transURLSt url no http err!");
        return null;
    }

    let seg = url.indexOf("/");
    if (seg === -1) {
        ret.host = url;
        ret.path = "/";
    }
    else {
        let stidx = ret.isHttps ?  8 :7;
        ret.host = u.slice(stidx, stidx+seg);
        ret.path = u.slice(stidx+seg);

    }
    if (ret.port>0)
    {
        ret.host = ret.host.substr(0,ret.host.lastIndexOf(":"));
    }
    ret.path = encodeURI(ret.path);
    return ret;
} 


// 递归创建目录 同步方法
export function mkdirsSync(dirname: string) {
    if (FS.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(PATH.dirname(dirname))) { //path.dirname 返回上层目录; ./aaa/bbb 时返回 ./aaa
            FS.mkdirSync(dirname);
            return true;
        }
    }
}


export function getGradeid(k: string): number {
    if ( k.indexOf("一") >= 0 ) return 1;
    if ( k.indexOf("二") >= 0 ) return 2;
    if ( k.indexOf("三") >= 0 ) return 3;
    if ( k.indexOf("四") >= 0 ) return 4;
    if ( k.indexOf("五") >= 0 ) return 5;
    if ( k.indexOf("六") >= 0 ) return 6;
    return 0;
}

export function getKindid(k:string):number{

    return 0;
}

export function getExeid(k:string):number{

    return 0;
}


//let obj2 = JSON.parse(JSON.stringify(obj1)); // 简单深拷贝
export function deepClone(obj:any):any {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }

    let copy:any = Array.isArray(obj) ? [] : {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepClone(obj[key]); // 递归拷贝每个属性
        }
    }
/*
优点：
    能够拷贝对象中的所有嵌套属性。
    支持数组的深拷贝。
局限性：
    对于深度非常大的嵌套对象，递归可能会导致性能问题。
    无法处理循环引用的对象结构
*/
    return copy;
}





















export class pages_st
{
    public url_fmt:string=""; // http://xxx.xxx-{re}.com
    public pagecount:number = 0; 
    public getUrl(id:number)
    {
        return this.url_fmt.replace("{re}",id.toString());
    }
}

export function getPagesST(els:any, $:any,segkey:string="-", numcb:any=null,urlcb:any=null) //$ = cheerio.load(...)
{
        let opurl = "";
        let count = 0;
        for (let i=0, len = els.length;i<len;i++)
        {
            let element = els[i];
            let url = $(element).attr("href");
            if (url == null || url.length<=1)
            {
                continue;
            }
            if (opurl == "")
            {
                opurl = url;
            }
            let num = 0;
            if (numcb)
            {
                num = numcb(url);
            }
            else
            {
                parseInt( $(element).text());
            }
            count = num > count ? num : count;
        }

        let st = new pages_st();
        if (urlcb)
        {
            st.url_fmt = urlcb(opurl);
        }
        else
        {
            let index1 = opurl.lastIndexOf(segkey);
            let index2 = opurl.lastIndexOf(".");
            let url_seg1 = opurl.substr(0, index1 + 1);
            let url_seg2 = opurl.substr(index2, opurl.length);
            st.url_fmt = url_seg1 + "{re}" + url_seg2;
        }
        st.pagecount = count;
        return  st;
}

