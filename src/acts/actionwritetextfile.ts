
import { each } from "cheerio/dist/commonjs/api/traversing";
import { ACTION_EXEC_TYPE, ActionBase, ActionState, ExecState } from "./actionbase";
import * as FS from "fs";
import * as PATH from 'path';
import * as BLUE from '../utils';

export class ActionWriteTextFile extends ActionBase
{
    private m_getkey_single: string = "";
    private m_filename: string = "";
    private m_travelflag: boolean= false;
    constructor(Parent:ActionBase|null,conf:any, holder:any,level:number)
    {
        super(Parent,conf, holder,level);
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
        self.m_filename= ary01[0]; //
        self.m_getkey_single = ary01[1]; //
        self.m_travelflag = ary01[2]
    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetParentDataByKey(self.m_getkey_single); 
        if (!processdata )
        {
            self.Errorlog("processdata is null");
            return ExecState.FAILED;
        }

        let fn = self.getWriteFileName(self.m_filename);
        let d = PATH.dirname(fn)
        let r = FS.existsSync(d);//检查目录文件是否存在
        if (!r) BLUE.mkdirsSync(d);//创建目录
        
        if (!self.m_travelflag) {
            if (!processdata.v) {
                self.Errorlog("processdata.v is null");
                return ExecState.FAILED;
            }
            FS.appendFileSync(fn, processdata.v)
        } else {
            let eles = processdata;
            let ary: any[] = []
            for (let key in eles) {
                let kk = key.substring(key.lastIndexOf("/")+1);
                ary.push({ k: parseInt(kk), v: eles[key].v });
            }

            let cfun = (a: any, b: any) => {
                return a.k > b.k ? 1 : -1
                //result is negative, a is sorted before b.
                //result is positive, b is sorted before a.
            };
            ary.sort(cfun);

           

            for (let i = 0; i < ary.length; i++) {
                let data = ary[i].v;
                data = ary[i].k + "\r\n" + data  
                //FS.appendFileSync(wfile,data.toString())
                FS.appendFileSync(fn, data)
            }
        }
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
