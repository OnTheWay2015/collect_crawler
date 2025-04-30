
import { each } from "cheerio/dist/commonjs/api/traversing";
import { ACTION_EXEC_TYPE, ActionBase, ActionState, ExecState } from "./actionbase";
import * as FS from "fs";
import * as PATH from 'path';
import * as BLUE from '../utils';

export class ActionWriteTextFile extends ActionBase
{
    private m_getkey_single: string = "";
    private m_filename: string = "";
    private m_dir: string = "";
    private m_travelflag: boolean= false;
    constructor(pdata:any,Parent:ActionBase|null,conf:any, holder:any,level:number)
    {
        super(pdata,Parent,conf, holder,level);
    }


    protected override Prepare(): void {
        let self = this;
        if (self.m_pAIActionConfig.TargetValue.length < 1 ||
            self.m_pAIActionConfig.TargetValue[0].length < 4) {
            self.Errorlog("no TargetValue");
            self.Done(ExecState.FAILED);
            return;
        }
        let ary01 = self.m_pAIActionConfig.TargetValue[0];
        self.m_dir= ary01[0]; //
        self.m_filename= ary01[1]; //
        self.m_getkey_single = ary01[2]; //
        self.m_travelflag = ary01[3]
    }

    protected override Run(): ExecState {
        let self = this;
        let processdata = self.GetDataByKey(self.m_getkey_single); 
        if (!processdata )
        {
            self.Errorlog("processdata is null");
            return ExecState.FAILED;
        }

        //let ust = self.GetMarkInfo();
        //let fn = self.GetStoreKey(self.m_filename);
        //fn =  fn.replace("/","_");
        //fn =  fn.replace("?","");
        //fn = ust.tag +"_" + fn;
        
        
        let fn = self.FormMarkKey(self.m_filename);
        let r = FS.existsSync(self.m_dir);//检查目录文件是否存在
        if (!r) BLUE.mkdirsSync(self.m_dir);//创建目录
        
        let wfn = self.m_dir + "/" + fn;
        if (!self.m_travelflag) {
            if (!processdata.v) {
                self.Errorlog("processdata.v is null");
                return ExecState.FAILED;
            }
            FS.writeFileSync(wfn, processdata.v)
        } else {
            let eles = processdata;
            let ary: any[] = []
            for (let key in eles) {
                let m =new RegExp("([0-9]+$)");
                let mk = key.match(m);
                let kk = mk?.at(0)?.toString();
                let keyidx = kk == undefined ? 0 : parseInt(kk);
                //let kk = key.substring(key.lastIndexOf("/")+1);
                ary.push({ k:keyidx, v: eles[key].v });
            }

            let cfun = (a: any, b: any) => {
                return a.k > b.k ? 1 : -1
                //result is negative, a is sorted before b.
                //result is positive, b is sorted before a.
            };

            ary.sort(cfun);
            
            FS.writeFileSync(wfn, "");
            for (let i = 0; i < ary.length; i++) {
                let data = ary[i].v;
                let kk =  ary[i].k
                data = "第" + kk + "章" + "\r\n" + data  
                //FS.appendFileSync(wfile,data.toString())
                FS.appendFileSync(wfn, data)
            }
        }
        self.log("write file ok:"+ wfn);
        return ExecState.OK;
    }

    //private getWriteFileName(n:string):string
    //{
    //    let self = this;
    //    let r = /\{.*\}/;
    //    if (r.test(n)) {
    //        n = n.replace(r, self.GetStoreTag())
    //    }
    //    return n;
    //}


};
