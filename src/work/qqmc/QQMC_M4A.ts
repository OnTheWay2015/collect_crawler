
import { BlueNodeFile } from "../../collects/node";

export class QQMC_M4A extends BlueNodeFile 
{
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        if (data.indexOf("<html")>=0)
        {
            return;
        }
        super.onRequestRes(data,res)
        let pdata = self.mProcessData;
        
        self.writefile(pdata.json,"");
    }

}


