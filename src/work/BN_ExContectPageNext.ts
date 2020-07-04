import { BlueNode} from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//step5 :
export class BN_ExContectPageNext extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 


        let $ = cheerio.load(data); //采用cheerio模块解析html
        BLUE.error("BN_ExTypeContect todo answer page!" );


    }
}
