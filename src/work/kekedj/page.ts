import * as configs from "../../configs";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';

export class Page extends BlueNode{
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any,res:any): void {
        let self = this;
        super.onRequestRes(data, res); 
        
        BLUE.log(data);
        self.debugPrintHeaders(); 
        data = data.data;
        let uri = data.mp3;
        
        if (!uri)
        {
            BLUE.log(data);
            BLUE.error("error:page mp3 not exsit!");
            return;
        }
        
        let dir = self.getPathSingle(uri);
        let filename = PATH.basename(uri);
        filename = filename.substr(0,filename.indexOf("."));
        self.setWritePath(dir);
        self.writefile(filename + ".json", JSON.stringify(data));
        self.addSubNode(
                configs.NODE_TAG.STEP_FILE_BASE,
                uri,
                {writePath:dir},
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







