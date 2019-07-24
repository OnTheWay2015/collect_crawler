import { BlueNode, NODE_TAG } from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';

//step5 :
export class BN_ExContectPageNext extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 

        let $ = cheerio.load(data); //采用cheerio模块解析html
        //let select = "td[class='headfont12']";
        //let select = "head";
        let select = "div[class='borderD']";
        
        let s = $(select);
        BLUE.log(s.text());
        BLUE.log(<string>s.html());

    }
}