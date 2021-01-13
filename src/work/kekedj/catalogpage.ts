import * as configs from "../../configs";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';

export class CatalogPage extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected async onRequestRes(data: any,res:any) {
        let self = this;
        super.onRequestRes(data, res); 
        let $ = cheerio.load(data); //采用cheerio模块解析html
        let itm = {};
        let els = self.selectDom($,$, [
            'div[class="list_music clearfix"]'
            ,'a'
        ]);

        if (els.length<=0){
            BLUE.error("no Dom element select")
            return;
        }

        for (let i=0, len = els.length;i<len;i++)
        {
            let element = els[i];
            let datav= $(element).attr("data-value");
            if (datav == null || datav.length<=1)
            {
                continue;
            }
            let path =  "/index.php?ac=music_getMusic";
            let postUrl = self.getWebSit() + path;
            let addheaders = { 
                headers: {
                    referer: self.getUrl() 
                    ,Origin: self.getWebSit()
                }
                ,postData:{id:parseInt(datav)}
             };
            let pdata = {};
            BLUE.mergeObject(pdata, self.mProcessData);
            BLUE.mergeObject(pdata, addheaders);
            self.addSubNode(
                configs.NODE_TAG.STEP_PAGE,
                postUrl,
                pdata,
                self.mRootData);
                

            //let info:any = await self.AX().post(postUrl,{id:datav});
            
            //self.addSubNode(
            //    configs.NODE_TAG.STEP_FILE_M4A,
            //    info.mp3,
            //    itm,
            //    self.mRootData);
            //BLUE.log(info);
        } 

    }
}
 