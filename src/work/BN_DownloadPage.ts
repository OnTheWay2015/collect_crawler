
import * as configs from "../configs";
import { BlueNode} from "../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../utils';
import * as PATH from 'path';

export class BN_DownloadPage extends BlueNode {
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any, res: any): void {
        let self = this;

        data = self.testEncoding(data);

        super.onRequestRes(data, res);

        let itms: any = [];

        let $ = cheerio.load(data); //采用cheerio模块解析html

        //test
        //BLUE.log($.html());

        let downloadhrefs = self.selectDom($, $, [
            "script"
        ]);//var info

        if (downloadhrefs == null || downloadhrefs.length <= 0) {
            BLUE.log($.html());
            BLUE.error("no downloadhrefs 1 select, url[" + self.getUrl() + "]");
            return;
        }

        let downloadinfo = null;
        for (let i = 0; i < downloadhrefs.length; i++) {
            let href = downloadhrefs[i];

            //let downloadpath= $(href).attr("src");
            //let downloadpath= $(href).data();
            //let downloadpath= $(href).val();
            let node = $(href)[0];
            let downloadpath = node.childNodes[0].nodeValue;
            if (!downloadpath || downloadpath.indexOf("var info") < 0) {
                continue;
            }
            downloadinfo = downloadpath;
            break;
        }
        if (downloadinfo == null) {
            BLUE.log($.html());
            BLUE.error("no downloadhrefs 2 select , url[" + self.getUrl() + "]");
            return;
        }
        let fff: any;
        let fst = "fff = function (){"
        let fcontent = "";
        fcontent += downloadinfo;
        fcontent += "return info;";
        let fend = "};"
        let fstring = fst + fcontent + fend;
        try {
            eval(fstring);
        }
        catch (err) {
            BLUE.log(" --- eval :" + fstring);
            return;
        }
        let info: any = fff();
        let server = "http://zj.djye.com/";
        let id = info.id;
        let durl = server + info.playurl + ".m4a";
        let dir = PATH.dirname(info.playurl);
        let filename = PATH.basename(info.playurl);
        self.setWritePath(dir);
        self.writefile(filename + ".json", JSON.stringify(info));
        //JSON.parse(jsonstr); //可以将json字符串转换成json对象 
        //JSON.stringify(jsonobj); //可以将json对象转换成json对符串 



        BLUE.log("m4a info:");
        BLUE.log(info);
        BLUE.log("     >>> id[" + id + "] name[" + info.name + "] downloadpathUrl:" + durl);
        let addheaders = { headers: { referer: self.getUrl() } };
        let pdata = BLUE.mergeObject(self.mProcessData, addheaders);
        self.addSubNode(
            configs.NODE_TAG.STEP_300,//File
            durl,
            pdata,
            self.mRootData);


    }
}
