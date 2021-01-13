import { BlueNode, BlueNodeFile } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';
import * as FS from 'fs';

export class BN_FileImage extends BlueNodeFile{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        
        BLUE.log("BN_IMAGE act");
    }
}







