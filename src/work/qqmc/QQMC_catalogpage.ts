import * as constants from "../../constants";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as FS from 'fs';

export class QQMC_CatalogPage extends BlueNode {
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any, res: any): void {
        let self = this;
        super.onRequestRes(data, res);
        let $ = cheerio.load(data); //采用cheerio模块解析html
        //BLUE.log($.html());
        let itm = {};
        let els = self.selectDom($, $, [
            'div[class="songlist"]',
            "ul",
            "li"
        ]);
        if (els == null|| els.length <=0) {
            BLUE.error("QQMC_Catalog no Dom element select")
            return;
        }


        let server = "https://mp7.t57.cn:8399/";
        for (var i = 0; i < els.length; i++) {
            var v = els[i].attribs;
            if (v["data-mp3"] == undefined) {
                continue;
            }
            var dataid = v["data-id"];
            var datamp3 = v["data-mp3"];
            var datatitle = v["data-title"];

            let ext = ".m4a";
            let durl = server + datamp3 + ext;
            let name = datatitle + "_" + dataid + ext;
            let namejson = datatitle + "_" + dataid + ".json.json";
            let d = { name: name, json:namejson};
            let pdata = BLUE.mergeObject(self.mProcessData, d);

            let fullpath = constants.FILE_DIR_ROOT + "/" + namejson;
            let cfr = FS.existsSync(fullpath);//检查目录文件是否存在
            if (!cfr) {

                self.addSubNode(
                    constants.NODE_TAG.STEP_FILE_M4A,//File
                    durl,
                    pdata,
                    self.mRootData);
            }
        }

    }
}
 