import * as constants from "../../constants";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';

export class CatalogPage extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected async onRequestRes(data: any,res:any) {
        let self = this;
        super.onRequestRes(data, res); 
        
        //BLUE.log(data);
        
        let $ = cheerio.load(data); //采用cheerio模块解析html
        let itm = {};
        let els = self.selectDom($,$, [
            'tr[class="tr3 t_one"]'
            ,'h3'
            ,'a'
        ]);

        if (els.length<=0){
            BLUE.error("no Dom element select")
            return;
        }


        let check_keyarr :string[]= [
            
            //"亚洲无码㊣↗经典合集",
            
            "最新國產㊣↗精品合集",
            "歐美無碼㊣↗️精彩合集",
            "欧美無码合集",
            "精品国产自拍",
            "国产精品AV",
            "國產無碼㊣↗️精彩合集"
        ];
       
        let opcnt = 0;
        //test
        //for (let i=0, len = els.length;i<20;i++)
        for (let i=0, len = els.length;i<len;i++)
        {
            //if (opcnt >= 5)
            //{
            //    break;
            //}
            let element = els[i][0];
            if (!element.childNodes || element.childNodes.length<=0)
            {
                continue;
            }
            let txtnode = element.childNodes[0];
            if (txtnode.type != "text" && 
                !(txtnode.name=="font" &&txtnode.type == "tag" ))
            {
                continue;
            }
            let datav= $(txtnode).text();
            if (datav == null || datav.length<=0)
            {
                continue;
            }

            //BLUE.log("link idx["+i+"] title["+datav+"]")
            let ok:boolean = false;

            for(let i in check_keyarr )
            {
                if (datav.indexOf(check_keyarr[i]) >= 0 )
                {
                    ok = true;
                    break;
                }
            }
            if (!ok)
            {
                continue;
            }
            opcnt++;

            //if (datav.indexOf("合集") < 0 )
            //{
            //    continue;
            //}
            //if (datav.indexOf("有碼") >= 0 || datav.indexOf("有码") >=0)
            //{
            //    continue;
            //}


            BLUE.log("start=>" + datav);
            let href = $(element).attr("href");
            let path =  self.getPath();
            path = path.substring(0,path.lastIndexOf("/")+1 );
            
            let postUrl = self.getWebSit()+ path + href;
            let addheaders = { 
                headers: {
                    referer: self.getUrl() 
                    ,Origin: self.getWebSit()
                }
             };
            let pdata = {};
            BLUE.mergeObject(pdata, self.mProcessData);
            BLUE.mergeObject(pdata, addheaders);
            self.addSubNode(
                constants.NODE_TAG.STEP_PAGE,
                postUrl,
                pdata,
                self.mRootData);
           
                
            //test 
            //break;
        } 

    }
}
 