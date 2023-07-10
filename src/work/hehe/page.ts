import * as configs from "../../configs";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';
import * as FS from 'fs';
class downloadst {
    public content!:string;
    public type!:number;  //=1,desc =2 jpg =3 url =4 png

}
export class Page extends BlueNode {
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any, res: any): void {
        let self = this;
        super.onRequestRes(data, res);
        
        //BLUE.log(data);

        let $ = cheerio.load(data); //采用cheerio模块解析html
        let itm = {};
        let els = self.selectDom($, $, [
            'div[id="read_tpc"]'  //id read_tpc
        ]);


        let MD5 = require('md5-node');
        let linkmd5 = MD5(self.getUrl());
        
        let imgfileExt = ".jpg";
        let opfun = (arr: downloadst[]) => {
            if (arr.length < 2) {//desc, imgs , download page 
                BLUE.log("op download infos err!");
                return;
            }

            for (let i = 0; i < arr.length; i++) {
                let v = arr[i];
                if (v.type == 1)
                {
                    continue;
                }
                let pdata:any = {
                    name: linkmd5+"_"+i
                    //writePath: name 
                };

                if (v.type == 3) {//bt file
                    self.addSubNode(
                        configs.NODE_TAG.STEP_FILE_PAGE,
                        arr[i].content,
                        pdata,
                        self.mRootData);
                }
                else if (v.type == 2 || v.type==4) {//img file
                    let fname = PATH.basename(linkmd5+imgfileExt);
                    let pathFile = configs.FILE_DIR_ROOT +"/" + fname;
                    let r = FS.existsSync(pathFile);//检查目录文件是否存在
                    pdata["fileExt"] = imgfileExt;
                    if (!r) {
                        self.addSubNode(
                            configs.NODE_TAG.STEP_FILE_BASE,
                            v.content,
                            pdata,
                            self.mRootData);
                    }
                }
            }
        };

        let startkey: string = "影片名稱";
        let startkey1: string = "影片名称";

        let endkey: string = "下载网址";
        let arr = [];
        for (let i = 0; i < els.length; i++) {
            let n = els[i];
            let flag = 1; // 0 find 影片名稱; 1 find 下载网址 
            for (let j = 0; j < n.children.length; j++) {
                let subnode = n.children[j];
                if (subnode.type == "text") {
                    let tdata: string = subnode.data;

                    if (tdata.indexOf(startkey) >= 0 ||
                        tdata.indexOf(startkey1) >= 0) {
                        let len = tdata.indexOf(startkey)
                        let len1 = tdata.indexOf(startkey1)
                        flag = 1;
                        tdata = tdata.substr(7);
                        if (tdata.length < 2) {
                            tdata = "md5";
                        }
                        let v = new downloadst();
                        v.type = 1;
                        v.content= tdata;
                        arr.push(v);
                        continue;
                    }


                    if (tdata.indexOf(endkey) >= 0) {
                        flag = 0;
                        subnode = n.children[j + 1];
                        if (subnode.type == "tag" && subnode.name == "a") {
                            let v = new downloadst();
                            v.type = 3;
                            v.content= subnode.attribs.href;
                            arr.push(v);
                        }
                    }
                    continue;
                }
                if (subnode.type != "tag") {
                    continue;
                }
                if (subnode.name == "img") {
                    if (subnode.attribs.src) {
                        let v = new downloadst();
                        v.type = 2;
                        v.content= subnode.attribs.src;
                        arr.push(v);
                    }
                }
                else if (subnode.name == "a") {
                    if (subnode.attribs.href.indexOf("/torrent")>=0)
                    {
                        let v = new downloadst();
                        v.type = 3;
                        v.content= subnode.attribs.href;
                        arr.push(v);
                        continue;
                    }
                    if (subnode.children.length <= 0) {
                        continue;
                    }
                    for (let j = 0; j < subnode.children.length; j++) {
                        let imgnode = subnode.children[j];
                        if (imgnode.type != "tag" || imgnode.name != "img") {
                            continue;
                        }
                        if (imgnode.attribs.src ) {
                            let v = new downloadst();
                            v.type = 2;
                            v.content= imgnode.attribs.src;
                            arr.push(v);
                        }
                    }
                }
            }
        }
        opfun(arr);

    }
}