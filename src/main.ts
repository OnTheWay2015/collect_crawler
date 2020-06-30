import * as BLUE from "./utils";
import * as configs from "./configs";
import { ProcessManager, ProcessIF } from "./manager/processManager";
import { NodeManager } from "./manager/nodeManager";
import { DB_CONN, DB_handle } from "./handles/dbHandler"
import { NODE_TAG } from "./collects/node";
import { BN_Root } from "./work/BN_Root";
import { BN_GradeExTypes } from "./work/BN_GradeExTypes";
import { BN_ExTypeContect } from "./work/BN_ExTypeContect";
import { BN_ExTypeContectPageNext } from "./work/BN_ExTypeContectPageNext";
import { BN_ExContect } from "./work/BN_ExContect";
import { BN_ExContectPageNext } from "./work/BN_ExContectPageNext";
import { BN_GradeExTypeList } from "./work/BN_GradeExTypeList";
export class main {
    constructor() {

    }
    public tagName = "main";
    public p_procMgr!: ProcessManager;
    public p_nodeMgr!: NodeManager;
    public p_dbbase!: DB_CONN;
    public p_dbgrades!: DB_handle;
    public p_dbkinds!: DB_handle;
    public p_dbexes!: DB_handle;

    private _cb:any;
    public init(cb:()=>void) {
        let self = this;
        self._cb = cb;
        self.p_dbbase = new DB_CONN(configs.DB_IP, {useUnifiedTopology:true}, {})
        self.p_dbgrades = new DB_handle(self.p_dbbase);
        self.p_dbkinds=  new DB_handle(self.p_dbbase);
        self.p_dbexes= new DB_handle(self.p_dbbase);

        self.p_procMgr = new ProcessManager(self);
        self.p_nodeMgr= new NodeManager(self);
        self.p_procMgr.init();
        self.p_nodeMgr.init();
        self.p_procMgr.addProcess(self.p_nodeMgr);

        self.regNodes();

        self.initDB(cb);
    }

    private initDB(cb: any) {
        let dbh = new DB_handle(this.p_dbbase);
        this.initDBNext(
            dbh
           ,[
            {dbname:configs.DB_BASE,colname:configs.DB_COL_GRADES, unique:true,keys:{gid:1}}
            ,{dbname:configs.DB_BASE,colname:configs.DB_COL_KINDS, unique:true,keys:{kid:1}}
            ,{dbname:configs.DB_BASE,colname:configs.DB_COL_EXERCISES, unique:true,keys:{eid:1}}
            ,{dbname:configs.DB_BASE,colname:configs.DB_COL_EXERCISES, unique:false,keys:{gid:1}}
            ,{dbname:configs.DB_BASE,colname:configs.DB_COL_EXERCISES, unique:false,keys:{kid:1}}
           ] 
            ,cb);
    }
    private initDBNext(dbh:DB_handle, itms:any,cb: any) {
        let self = this;
        if (itms.length <=0){
            cb();
        }else{
            let itm = itms.shift();
            let dbname = itm.dbname;
            let colname = itm.colname;
            let unique= itm.unique;

            dbh.createIndex((err: any, res: any) => {
                if (err){
                    BLUE.error( "dbname["+dbname+"] colname["+colname+"] createindex error!");
                    return;
                }
                self.initDBNext(dbh,itms,cb);
            }, dbname, colname, itm.keys, unique)
        }
    }
























    private _processData:any = {};

    /**
        mProcessData {
           processUrls:{}

           root: {
            nameRoot,年级名
            grade:年级
            grades:{
                //step1
                nameStep1,分类名
                type,分类编号
                exTypes:{
                    //step 3
                    nameEx: 习题名
                    content:内容
                    answer:答案 //step 5
                }

            }
           }

        }
      
     */
    //todo processData option function 
    //todo save and clear

    private regNodes():void{
        let self = this;
        self.p_nodeMgr.regNode( NODE_TAG.ROOT, BN_Root);
        
        self.p_nodeMgr.regNode( NODE_TAG.STEP_1, BN_GradeExTypes);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_10, BN_GradeExTypeList);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_2, BN_ExTypeContect);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_3, BN_ExTypeContectPageNext);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_4, BN_ExContect);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_5, BN_ExContectPageNext);
    
    //ROOT = 1,  root 每年级例表
    //STEP_1,  每年级
    //STEP_10,  每年级的题目分类例表
    //STEP_2,  分类下的子页
    //STEP_3,  子页秋翻页
    //STEP_4, 题目内容页 
    //STEP_5, 题目内容翻页 
    }
    public start(url:string) {
        let self = this;
        self.p_procMgr.start();
        self._start(url);
    }
    private _start(url: string): void {
        let self = this;
        self.p_nodeMgr.processNode(NODE_TAG.ROOT, url, {}, self._processData);
    }

    public redirection(location: string): void {
        let self = this;
        self.p_nodeMgr.processNode(NODE_TAG.ROOT, location, {}, self._processData);
    }
}
