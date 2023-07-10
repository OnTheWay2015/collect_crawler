import * as configs from "../../configs";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';

export class KY_Page extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        
        BLUE.log("KY_Page act");


        let $ = cheerio.load(data); //采用cheerio模块解析html
        let downloadhrefs = self.selectDom($, $, [
            "script"
        ]);//var info

        if (downloadhrefs == null || downloadhrefs.length <= 0) {
            BLUE.log($.html());
            BLUE.error("no downloadhrefs 1 select, url[" + self.getUrl() + "]");
            return;
        }

        let downloadinfo = null;
        let search ="var music";
        for (let i = 0; i < downloadhrefs.length; i++) {
            let href = downloadhrefs[i];

            //let downloadpath= $(href).attr("src");
            //let downloadpath= $(href).data();
            //let downloadpath= $(href).val();
            let node:any = $(href)[0]; //todo err?
            if (!node.childNodes || node.childNodes.length<=0)
            {
                continue;    
            }
            let downloadpath = node.childNodes[0].nodeValue;
            if (!downloadpath || downloadpath.indexOf(search) < 0) {
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
        var fst = "function f666(){var did=0; var mp={}; mp.create=(a,b)=>{}; ";
        let fcontent = "";
        fcontent += downloadinfo;
        //fcontent += "return info;";
        let fend = " this.did=did; this.music = music; } f666.prototype.getitems = function() { return { did:this.did, music:this.music}; };  fff=new f666();"
        let fstring = fst + fcontent + fend;
        try {
            eval(fstring);
        }
        catch (err) {
            //BLUE.error(err);
            BLUE.log(" --- eval error :" + fstring);
            return;
        }
        //let info: any = fff;
        let info = fff.getitems();
        //let server = "http://zj.djye.com/";
        let server ="https://shiting.djkuyao.com:60";

        let id = info.id;
        let uri = info.music.file;
        let durl = server +  uri;
        //durl = encodeURIComponent(durl);

        let dir = PATH.dirname(uri);
        let filename = PATH.basename(uri);
        filename = filename.substr(0,filename.indexOf("."));
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
            configs.NODE_TAG.STEP_FILE_M4A,//File
            durl,
            pdata,
            self.mRootData);
    }
}


/**
 * 
 * 
 * 
 * 
//原型
 https://www.cnblogs.com/hanjian99/p/10650288.html


function f666()  //类构造
{
	var value=123;  //默认数据
	this.v = value; //类属性
}

//类方法
f666.prototype.getvalue = function(){
 return this.v;
};  

//注意，定义方法时不能用　前头方法(lambdar 的this指向不对),要向上面那样用 function 定义 
//f666.prototype.getvalue = ()=> { 
// return this.v;
//};  
 
var fff=new f666(); //创建实例
console.log(fff.getvalue());



* 
 */







