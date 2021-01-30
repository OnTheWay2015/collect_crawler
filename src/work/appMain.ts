import * as BLUE from "../utils";
import * as configs from "../configs";
import { NODE_TAG } from "../configs";
import { ProcessManager, ProcessIF } from "../manager/processManager";
import { NodeManager } from "../manager/nodeManager";
//import { DB_CONN, DB_handle } from "../handles/dbHandler"
export class appMain {
    constructor() {

    }
    public tagName = "main";
    public p_procMgr!: ProcessManager;
    public p_nodeMgr!: NodeManager;
    //public p_dbbase!: DB_CONN;
    //public p_dbgrades!: DB_handle;
    //public p_dbkinds!: DB_handle;
    //public p_dbexes!: DB_handle;

    private _cb:any;
    public init(
        cb:()=>void
        ,dbflag:boolean //是否初始化db
        ,nds:{tag:string,n:any}[] //注册处理节点
    ) {
        let self = this;
        self._cb = cb;
        if (dbflag)
        {
            //self.p_dbbase = new DB_CONN(configs.DB_IP, { useUnifiedTopology: true }, {})
            //self.p_dbgrades = new DB_handle(self.p_dbbase);
            //self.p_dbkinds = new DB_handle(self.p_dbbase);
            //self.p_dbexes = new DB_handle(self.p_dbbase);
        }

        self.p_procMgr = new ProcessManager(self);
        self.p_nodeMgr= new NodeManager(self);
        self.p_procMgr.init();
        self.p_nodeMgr.init();
        self.p_procMgr.addProcess(self.p_nodeMgr);

        self.p_nodeMgr.regNodes(nds);

        if (dbflag)
        {
            self.initDB(cb);
        }
        cb();
    }

    private initDB(cb: any) {
        //let dbh = new DB_handle(this.p_dbbase);
        //this.initDBNext(
        //    dbh
        //   ,[
        //    {dbname:configs.DB_BASE,colname:configs.DB_COL_GRADES, unique:true,keys:{gid:1}}
        //    ,{dbname:configs.DB_BASE,colname:configs.DB_COL_KINDS, unique:true,keys:{kid:1}}
        //    ,{dbname:configs.DB_BASE,colname:configs.DB_COL_EXERCISES, unique:true,keys:{eid:1}}
        //    ,{dbname:configs.DB_BASE,colname:configs.DB_COL_EXERCISES, unique:false,keys:{gid:1}}
        //    ,{dbname:configs.DB_BASE,colname:configs.DB_COL_EXERCISES, unique:false,keys:{kid:1}}
        //   ] 
        //    ,cb);
    }
    //private initDBNext(dbh:DB_handle, itms:any,cb: any) {
    //    let self = this;
    //    if (itms.length <=0){
    //        cb();
    //    }else{
    //        let itm = itms.shift();
    //        let dbname = itm.dbname;
    //        let colname = itm.colname;
    //        let unique= itm.unique;

    //        dbh.createIndex((err: any, res: any) => {
    //            if (err){
    //                BLUE.error( "dbname["+dbname+"] colname["+colname+"] createindex error!");
    //                return;
    //            }
    //            self.initDBNext(dbh,itms,cb);
    //        }, dbname, colname, itm.keys, unique)
    //    }
    //}
    
    private _processData:any = {};

    //todo processData option function 
    //todo save and clear
    protected workStart(url:string, t:NODE_TAG) {
        let self = this;
        self.p_procMgr.start();
        self._start(url,t);
    }
    public test(url:string, t:NODE_TAG ) {
        let self = this;
        self.p_nodeMgr.processNode(t,url,{},{});
    }
    private _start(url: string, t:NODE_TAG=NODE_TAG.ROOT): void {
        let self = this;
        self.p_nodeMgr.processNode(t, url, {}, self._processData);
    }

    public redirection(location: string, curr:NODE_TAG): void {
        let self = this;
        let tag = curr;
        if (curr == NODE_TAG.ROOT)
        {
            curr = NODE_TAG.STEP_1;
        }
        self.p_nodeMgr.processNode(tag, location, {}, self._processData);
    }

    public setGlobalData(k:string,v:any)
    {
        let self = this;
        if (self._processData[k])
        {
            BLUE.error("setGlobalData["+k+"] exsit!");    
        }
        self._processData[k] = v;
    }
    public getGlobalData(k:string):any
    {
        let self = this;
        if (self._processData[k])
        {
            return self._processData[k];
        }
        return null;
    }

    private _headerMap:any = {}; 
    public setDefHeaders(k:string, h:any)
    {
        this._headerMap[k] = h;
    }
    public getDefHeaders(k:string)
    {
        return this._headerMap[k] ;
    }
}
