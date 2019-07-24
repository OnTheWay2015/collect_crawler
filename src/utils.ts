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

export function transURLSt(url: string): urlST | null {
    url = url.toLocaleLowerCase();
    let regHttps = /^[hH]{1}[tT]{2}[pP]{1}[sS]{1}:\/\//;
    let regHttp = /^[hH]{1}[tT]{2}[pP]{1}:\/\//;
    let ret = new urlST();
    if (regHttps.test(url)) {
        ret.isHttps = true;
        url = url.slice(8);
        log("https act!");
    }
    else if (regHttp.test(url)) {
        url = url.slice(7);
        log("http act!");
    }
    else {
        return null;
    }
    let seg = url.indexOf("/");
    if (seg === -1) {
        ret.host = url;
        ret.path = "/";
    }
    else {
        ret.host = url.slice(0, seg);
        ret.path = url.slice(seg);

    }
    return ret;
} 