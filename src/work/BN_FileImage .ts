import { BlueNode, BlueNodeFile } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';
import * as FS from 'fs';

//step1 : 各年级习题分类
export class BN_FileImage extends BlueNodeFile{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        
        BLUE.log("BN_IMAGE act");
        let filename =this.getFileNameFromUrl();
        //self.setWritePath("./ttt");
        self.writefile(filename,data);
    }
}







