import * as constants from "../../constants";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';

export class noval01_Catalog extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any, res: any): void {
        let self = this;
        super.onRequestRes(data, res);
        let $ = cheerio.load(data); //采用cheerio模块解析html

        let els = self.selectDom($, $, [
            "div[class='listmain']",
            "a"
        ]);
        if (els == null || els.length <= 0) {
            BLUE.error("noval01_Root no Dom element select")
            return;
        }


        let u = "";
        for (var i = 0; i < els.length; i++) {
            let url: any = $(els[i]).attr("href");
            if (!url) {
                continue;
            }
            let filename = PATH.basename(url);
            filename = filename.substr(0, filename.indexOf("."));
            u = self.getFullUrl(url, self.getUrl());
            self.addSubNode(
                constants.NODE_TAG.STEP_CATALOG_PAGE,
                u,
                {filename:filename},
                self.mRootData);
        }




    }
}
 