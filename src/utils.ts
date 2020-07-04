import { BlueNode } from "./collects/node";

export const GET:string="get";
export const POST:string="post";

export function log(str:string){
    console.log(str);
}
export function notice(str:string){
    console.log(str);
}
export function error(str:string){
    //let e = Error();
    //console.log(e.stack);
    console.error(str);
}


//--------------------------------
export class urlST{
    public isHttps:boolean = false;
    public host:string= "";
    public path:string= "/";
}

export function transURLSt(u: string): urlST | null {
    let url = u.toLocaleLowerCase();
    let regHttps = /^[hH]{1}[tT]{2}[pP]{1}[sS]{1}:\/\//;
    let regHttp = /^[hH]{1}[tT]{2}[pP]{1}:\/\//;
    let ret = new urlST();
    if (regHttps.test(url)) {
        ret.isHttps = true;
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
    return ret;
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


export function mergeObject(to: any, from: any): void {
    for (let k in from) {
        to[k] = from[k];
    }
    return to;
}