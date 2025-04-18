

import { ACTION_EXEC_TYPE, ActionBase, ActionState, ExecState } from "./actionbase";
import * as FS from "fs";
import * as PATH from 'path';
import * as BLUE from '../utils';

export class ActionReadTextFile extends ActionBase
{
    private m_storekey: string = "";
    private m_filename: string = "";
    private m_dir: string = "";
    constructor(pdata:any,Parent:ActionBase|null,conf:any, holder:any,level:number)
    {
        super(pdata,Parent,conf, holder,level);
    }


    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 1 ||
            self.m_pAIActionConfig.TargetValue[0].length < 3) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }
        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        self.m_dir= ary01[0]; //
        self.m_filename= ary01[1]; //
        self.m_storekey= ary01[2]; //
    }

    protected override Run(): ExecState {
        let self = this;

        let fn = self.FormMarkKey(self.m_filename);
        let r = FS.existsSync(self.m_dir);//检查目录文件是否存在
        if (!r) {
            self.Errorlog("not exsit dir:" + self.m_dir);
            return ExecState.FAILED;
        }
        let rfn = self.m_dir + "/" + fn;
        let data = FS.readFileSync(rfn)
        if (!data) {
            self.Errorlog("no file data:" + rfn);
            return ExecState.FAILED;
        } 
        self.SetDataByKey(self.m_storekey,{v:data.toString()} );
        return ExecState.OK;
    }
};
