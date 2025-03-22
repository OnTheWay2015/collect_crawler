
import {APP } from "../app"
import * as M from "../appMain"; 

import { NODE_TAG,HEADER_TAG,FILE_DIR_ROOT  } from '../../constants';
import { noval01_Root} from './noval01_root';
import { noval01_Catalog } from "./noval01_catalog";
import { noval01_CatalogPage } from "./noval01_catalogpage";


import * as HTTP from 'http';
import { REQ_TYPE } from "../../collects/node";
import * as FS from 'fs';

export class noval01_APP extends M.appMain implements APP {
    constructor() {
        super();
    }


    private _changeString(fname:string):void {
            let data = FS.readFileSync(fname)
            let content = data.toString().replace(/。/g,"。\r\n");
            FS.writeFileSync(fname,content)
    }

    private changeString():void {
       let files = FS.readdirSync(FILE_DIR_ROOT)
        let self = this;
        files.forEach((file)=>{
            let fname = FILE_DIR_ROOT + "/" + file
            self._changeString(fname);
        });
    }

    private _packbook(tag:string):void {
        var opdir = FILE_DIR_ROOT + "/"+tag
       var files = FS.readdirSync( opdir )
       var wfile =FILE_DIR_ROOT  + "/" + tag + ".txt";
        for (let i=1;i<=files.length;i++)
        {
            let fn = opdir + "/" + i + ".txt"
            if (!FS.existsSync(fn))  continue;
            let data = FS.readFileSync( fn )
            FS.appendFileSync(wfile,"第"+ i + "章\r\n")
            FS.appendFileSync(wfile,data.toString())
            FS.appendFileSync(wfile,"\r\n")
        }

        let data = FS.readFileSync(wfile)
        let content = data.toString().replace(/。/g, "。\r\n");
        FS.writeFileSync(wfile, content)
    }

    private packbook():void {
       var tags= FS.readdirSync( FILE_DIR_ROOT )
        for (let i=0;i<tags.length;i++)
        {
            this._packbook(tags[i]);
        }
    }
    //private url ="https://www.bi09.cc/book/44499" //弃宇宙
    //private url ="https://www.bi09.cc/book/46358/" //怪物被杀就会死  00
    //private url ="https://www.bi09.cc/book/182628/" //苟在妖武乱世修仙 01
    //private url ="https://www.bi09.cc/book/43883/" //不科学御兽 02
    //private url ="https://www.bi09.cc/book/95047/" //都重生了谁谈恋爱啊 03
    //private url ="https://www.bi09.cc/book/30527/" //离婚后前妻成了债主 04

    //private url ="https://www.bi09.cc/book/160989/" //逼我重生是吧  05
    //private url ="https://www.bi09.cc/book/140921/" //太平令
    //private url ="https://www.bi09.cc/book/178024/" //我的超能力每周刷新
    //private url ="https://www.bi09.cc/book/141829/" //1979黄金时代
    //private url ="https://www.bi09.cc/book/141390/" //高武纪元
    //private url ="https://www.bi09.cc/book/43259/" //离婚后的我开始转运了
    //private url ="https://www.bi09.cc/book/172104/" //择日走红
    
    //private url ="https://www.bi09.cc/book/43312/" //重塑千禧年代
    //private url ="https://www.bi09.cc/book/44952/" //赤心巡天
    //private url ="https://www.bi09.cc/book/179582/" //重生在火红年代的悠闲生活
    //private url ="https://www.bi09.cc/book/159393/" //离婚后，我继承了游戏里的财产
    //private url ="https://www.bi09.cc/book/109819/" //导演的快乐你不懂
    //private url ="https://www.bi09.cc/book/168391/" //重回1980年去享福
    //private url ="https://www.bi09.cc/book/123813/" //我是导演，我不比烂
    //private url ="https://www.bi09.cc/book/138808/" //重生飞扬年代
    private url ="https://www.baidu.com" //
    //private url ="" //
    //private url ="" //
    //private url ="" //
    //private url ="" //
   
    ;//
    private sttag:NODE_TAG = NODE_TAG.ROOT;
    public start(): void {
        this.packbook();
        return;

        let nds = [
            //{ tag: NODE_TAG.ROOT, n: noval01_Root , reqtype:REQ_TYPE.PUPPETEER}
            { tag: NODE_TAG.ROOT, n: noval01_Root }
          , { tag: NODE_TAG.STEP_CATALOG, n:noval01_Catalog,limit:true}
          , { tag: NODE_TAG.STEP_CATALOG_PAGE, n:noval01_CatalogPage,limit:true}
        ];
        let self = this;
        self.init(
            () => {
                self.workStart(this.url,this.sttag);
                //workStartArray
            }
            , false
            , nds
        );
    }

}
