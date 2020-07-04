import * as configs from "../configs";
import { BlueNode, BlueNodeFile } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';
import * as FS from 'fs';

export class BN_FileM4A extends BlueNodeFile{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        
        BLUE.log("BN_FileM4A act");

        let filename =this.getFileNameFromUrl();
        self.writefile(filename,data);
    }
}




