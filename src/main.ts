import * as BLUE from "./utils";
import * as configs from "./configs";
import { ProcessManager, ProcessIF } from "./manager/processManager";
import { NodeManager } from "./manager/nodeManager";
import { DB_CONN, DB_handle } from "./handles/dbHandler"
import { NODE_TAG } from "./configs";
import { BN_Root } from "./work/BN_Root";
import { BN_GradeExTypes } from "./work/BN_GradeExTypes";
import { BN_ExTypeContect } from "./work/BN_ExTypeContect";
import { BN_ExTypeContectPageNext } from "./work/BN_ExTypeContectPageNext";
import { BN_ExContect } from "./work/BN_ExContect";
import { BN_ExContectPageNext } from "./work/BN_ExContectPageNext";
import { BN_GradeExTypeList } from "./work/BN_GradeExTypeList";
import { BN_FileImage} from "./work/BN_FileImage ";
import { BN_FileTorrent } from "./work/BN_FileTorrent";
import { BN_DownloadPage } from "./work/BN_DownloadPage";
import { BN_Page } from "./work/BN_Page";
import { BN_PageList } from "./work/BN_PageList";
import { BN_FileM4A } from "./work/BN_FileM4A";
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
    public init(
        cb:()=>void
        ,dbflag:boolean //是否初始化db
        ,nds:{tag:string,n:any}[] //注册处理节点
    ) {
        let self = this;
        self._cb = cb;
        if (dbflag)
        {
            self.p_dbbase = new DB_CONN(configs.DB_IP, { useUnifiedTopology: true }, {})
            self.p_dbgrades = new DB_handle(self.p_dbbase);
            self.p_dbkinds = new DB_handle(self.p_dbbase);
            self.p_dbexes = new DB_handle(self.p_dbbase);
        }

        self.p_procMgr = new ProcessManager(self);
        self.p_nodeMgr= new NodeManager(self);
        self.p_procMgr.init();
        self.p_nodeMgr.init();
        self.p_procMgr.addProcess(self.p_nodeMgr);

        //self.regNodes();
        self.p_nodeMgr.regNodes(nds);

        if (dbflag)
        {
            self.initDB(cb);
        }
        cb();
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

        self.p_nodeMgr.setLimitNodeTags({
            //[NODE_TAG.STEP_200]:true,
            //[NODE_TAG.STEP_5]:true,
            [NODE_TAG.STEP_300]:true,
        });
        self.p_nodeMgr.regNode( NODE_TAG.ROOT, BN_Root);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_1, BN_Page);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_5, BN_DownloadPage);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_300, BN_FileM4A);
        
        //self.p_nodeMgr.regNode( NODE_TAG.ROOT, BN_PageList);
        //self.p_nodeMgr.regNode( NODE_TAG.STEP_4, BN_Page);
        //self.p_nodeMgr.regNode( NODE_TAG.STEP_5, BN_DownloadPage);
        //self.p_nodeMgr.regNode( NODE_TAG.STEP_200, BN_FileTorrent);
        //self.p_nodeMgr.regNode( NODE_TAG.STEP_100, BN_FileImage);
        

        //self.p_nodeMgr.regNode( NODE_TAG.ROOT, BN_Root); 
        
        //self.p_nodeMgr.regNode( NODE_TAG.STEP_10, BN_GradeExTypeList);//各分类
        //self.p_nodeMgr.regNode( NODE_TAG.STEP_1, BN_GradeExTypes);//练习分页, 各练习 
        
        
        //self.p_nodeMgr.regNode( NODE_TAG.STEP_4, BN_ExContect);//练习内容
        //self.p_nodeMgr.regNode( NODE_TAG.STEP_5, BN_ExContectPageNext);//练习内容答案
        
        //self.p_nodeMgr.regNode( NODE_TAG.STEP_100, BN_IMAGE);
    
    //ROOT = 1,  root 
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
    public test(url:string, t:NODE_TAG ) {
        let self = this;
        self.p_nodeMgr.processNode(t,url,{},{});
    }
    private _start(url: string): void {
        let self = this;
        self.p_nodeMgr.processNode(NODE_TAG.ROOT, url, {}, self._processData);
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
}
