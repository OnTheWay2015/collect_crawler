
import { BlueNode} from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//step4 :
export class BN_ExContect extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        
        BLUE.error("todo save Ex question content");


        //let url = "https://files.eduuu.com/img/2019/11/25/124800_5ddb5d00044d0.png";
        //    self.addSubNode(
        //        NODE_TAG.STEP_100,
        //        url,
        //        { gid:self.mProcessData.gid,kid:self.mProcessData.kid},
        //        self.mRootData);
        


    }
}
