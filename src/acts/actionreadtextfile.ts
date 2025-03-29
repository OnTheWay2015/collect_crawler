

import { ACTION_EXEC_TYPE, ActionBase, ActionState, ExecState } from "./actionbase";
import * as FS from "fs";
import * as PATH from 'path';
import * as BLUE from '../utils';

export class ActionReadTextFile extends ActionBase
{
    private m_storekey: string = "";
    private m_filename: string = "";
    constructor(Parent:ActionBase|null,conf:any, holder:any,level:number)
    {
        super(Parent,conf, holder,level);
    }


    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 1 ||
            self.m_pAIActionConfig.TargetValue[0].length < 2) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }
        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        self.m_filename= ary01[0]; //
        self.m_storekey= ary01[1]; //
    }

    protected override Run(): ExecState {
        let self = this;
        let fn = self.m_filename;
        let d = PATH.dirname(fn)
        let r = FS.existsSync(d);//检查目录文件是否存在
        if (!r) BLUE.mkdirsSync(d);//创建目录
        let data = FS.readFileSync(fn)
        if (!data) {
            return ExecState.FAILED;
        } 
        self.SetDataByKey(self.m_storekey,{v:data.toString()} );
        return ExecState.OK;
    }

    private getWriteFileName(n:string):string
    {
        let self = this;
        let r = /\{.*\}/;
        if (r.test(n)) {
            n = n.replace(r, self.GetStoreTag())
        }
        return n;
    }


};
