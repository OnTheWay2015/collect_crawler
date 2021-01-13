
export class imageCollect{
    private _main!:any;
    private _url!:string;
    constructor(url:string,main:any,headers?:any) {
        let self = this;
        self._main= main;
        self._url  = url;
    }

    //info{idx:, data:}
    public act(info: any, cb: () => void): void {
        let self = this;
        //var stream = fs.createWriteStream(filename);
        //request(uri).pipe(stream).on('close', callback); 

    }
}