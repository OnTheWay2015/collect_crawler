import * as BLUE from "./utils";
import { ProcessManager, ProcessIF } from "./manager/processManager";
import { NodeManager } from "./manager/nodeManager";
import { NODE_TAG } from "./collects/node";
import { BN_Root } from "./work/BN_Root";
import { BN_GradeExTypes } from "./work/BN_GradeExTypes";
import { BN_ExTypeContect } from "./work/BN_ExTypeContect";
import { BN_ExTypeContectPageNext } from "./work/BN_ExTypeContectPageNext";
import { BN_ExContect } from "./work/BN_ExContect";
import { BN_ExContectPageNext } from "./work/BN_ExContectPageNext";
import { DbManager } from "./db/dbManager";
export class main {
    constructor() {

    }
    public tagName = "main";
    public p_procMgr!: ProcessManager;
    public p_nodeMgr!: NodeManager;
    public p_dbMgr!: DbManager;

    public init() {
        let self = this;
        self.p_procMgr = new ProcessManager(self);
        self.p_nodeMgr= new NodeManager(self);
        self.p_dbMgr= new DbManager(self);
        self.p_procMgr.init();
        self.p_nodeMgr.init();
        self.p_dbMgr.init({});
        self.p_procMgr.regeditProcess(self.p_dbMgr);
        self.p_procMgr.regeditProcess(self.p_nodeMgr);

        self.regNodes();
    }



    //ROOT = 1,  root
    //STEP_1,  每年级的题目分类
    //STEP_2,  分类下的子页
    //STEP_3,  子页秋翻页
    //STEP_4, 题目内容页 
    //STEP_5, 题目内容翻页 























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
        self.p_nodeMgr.regNode( NODE_TAG.STEP_2, BN_ExTypeContect);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_3, BN_ExTypeContectPageNext);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_4, BN_ExContect);
        self.p_nodeMgr.regNode( NODE_TAG.STEP_5, BN_ExContectPageNext);
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
