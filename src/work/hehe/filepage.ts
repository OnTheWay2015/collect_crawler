import * as constants from "../../constants";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';
import * as FS from 'fs';

export class FilePage extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any, res: any): void {
        let self = this;
        super.onRequestRes(data, res);

        //BLUE.log(data);

        let $ = cheerio.load(data); //采用cheerio模块解析html
        let itm = {};
        let els = self.selectDom($, $, [
            'a[class="uk-button "]'  //id read_tpc
        ]);

        for (let i = 0; i < els.length; i++) {
            let n = els[i];
            let href = $(n).attr("href");
            let website = self.getWebSit();
            let url = website + href; 

            let addheaders = { 
                headers: { referer: self.getUrl() }
            ,fileExt:".torrent" };
            let pdata = BLUE.mergeObject(self.mProcessData, addheaders);

            self.addSubNode(
                constants.NODE_TAG.STEP_FILE_BASE,
                url,
                pdata,
                self.mRootData);
            break;

        }
    }
}

