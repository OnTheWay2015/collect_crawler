import * as configs from "../configs";
import { BlueNode, BlueNodeFile } from "../collects/node";
import * as BLUE from '../utils';

export class BN_FileM4A extends BlueNodeFile{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        
        BLUE.log("BN_FileM4A act");

    }
}




