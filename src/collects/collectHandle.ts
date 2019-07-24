import * as cheerio from 'cheerio';
import * as BLUE from "../utils"
import {NodeIF}  from "./node"

export class CollectHandle{
    private m_html:string;
    private m_holderNode!:NodeIF;
    constructor(html:string, holderNode:NodeIF){
        this.m_html = html;
        this.m_holderNode=holderNode;
    }

    public parse(){
    }


}