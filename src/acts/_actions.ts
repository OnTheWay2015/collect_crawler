import * as BLUE from '../utils';
import { ActionBase, AIACTION_CONFIG } from "./actionbase";
import { ActionHttp } from './actionhttp';
import { ActionHttpFailedStore } from './actionhttpfailedstore';
import { ActionInterval } from "./actioninterval";
import { ActionReadTextFile } from './actionreadtextfile';
import { ActionFilterAttr } from './action_filter_attr';
import { ActionFilterText } from './action_filter_text';
import { ActionTextTrans } from './actiontexttrans';
import { ActionStoreSingle } from './actionstoresingle';
import { ActionTimes } from "./actiontimes";
import { ActionTravelLinks } from './actiontravellinks';
import { ActionWriteTextFile } from './actionwritetextfile';
import { ActionStoreTextMatch } from './actionstoretextmatch';
import { ActionStoreMove } from './actionstoremove';
import { ActionStoreSelect } from './actionstoreselect';
import { ActionStoreMoveToArray } from './actionstoremovetoarray';
import { ActionFilterNodeTag } from './action_filter_nodetag';
import { ActionStoreSet } from './actionstoreset';

//export enum ACTION_TYPE{ //因为在配置里有对应的数值,所以该枚举类型的位置不要调换 
//	BASE =1,
//	TIMES,
//	INTERVAL,
//	HTTP_REQ,
//	STORE_SINGLE ,
//	FILTER_ATTR, 
//	TRAVEL_LINKS,
//	WRITE_TXT_FILE,
//	FILTER_TEXT, 
//	TEXT_TRANS, 
//	HTTP_FAILED_STORE,
//};


export enum ACTION_TYPE{ 
	NONE="",
	BASE ="BASE",
	TIMES="TIMES",
	INTERVAL="INTERVAL",
	HTTP_REQ="HTTP_REQ",
	STORE_SET="STORE_SET",
	STORE_SINGLE ="STORE_SINGLE",
	STORE_MOVE="STORE_MOVE",
	STORE_MOVE_TO_ARRAY="STORE_MOVE_TO_ARRAY",
	STORE_SELECT="STORE_SELECT",
    STORE_TEXT_MATCH="STORE_TEXT_MATCH",
    STORE_TAG="STORE_TAG",
	FILTER_ATTR="FILTER_ATTR", 
	TRAVEL_LINKS="TRAVEL_LINKS",
	WRITE_TXT_FILE="WRITE_TXT_FILE",
	READ_TXT_FILE="READ_TXT_FILE",
	FILTER_TEXT="FILTER_TEXT", 
	FILTER_NODE_TAG="FILTER_NODE_TAG", 
	TEXT_TRANS="TEXT_TRANS", 
	HTTP_FAILED_STORE="HTTP_FAILED_STORE",
};


export const BASE_URL:string = "BASE_URL"
//===================================================
export function MakeAction(pdata:any,localinfo:any, holder:any, ab:ActionBase|null,Conf:AIACTION_CONFIG,Level:number):ActionBase|null
{
	//SAFE_DELETE(self.m_self.pCurr);
	//ActionBase* self.pCurr = nullptr;

    let cls = {
        [String(ACTION_TYPE.BASE)]: ActionBase
        , [String(ACTION_TYPE.TIMES)]: ActionTimes
        , [String(ACTION_TYPE.INTERVAL)]: ActionInterval
        , [String(ACTION_TYPE.HTTP_REQ)]: ActionHttp
        , [String(ACTION_TYPE.HTTP_FAILED_STORE)]:ActionHttpFailedStore 
        , [String(ACTION_TYPE.STORE_SET)]: ActionStoreSet
        , [String(ACTION_TYPE.STORE_SINGLE)]: ActionStoreSingle
        , [String(ACTION_TYPE.STORE_MOVE)]: ActionStoreMove
        , [String(ACTION_TYPE.STORE_MOVE_TO_ARRAY)]: ActionStoreMoveToArray
        , [String(ACTION_TYPE.STORE_SELECT)]: ActionStoreSelect
        , [String(ACTION_TYPE.STORE_TEXT_MATCH)]:ActionStoreTextMatch 
        , [String(ACTION_TYPE.FILTER_ATTR)]: ActionFilterAttr
        , [String(ACTION_TYPE.FILTER_TEXT)]: ActionFilterText
        , [String(ACTION_TYPE.FILTER_NODE_TAG)]: ActionFilterNodeTag
        , [String(ACTION_TYPE.TEXT_TRANS)]: ActionTextTrans
        , [String(ACTION_TYPE.TRAVEL_LINKS)]: ActionTravelLinks
        , [String(ACTION_TYPE.WRITE_TXT_FILE)]: ActionWriteTextFile
        , [String(ACTION_TYPE.READ_TXT_FILE)]: ActionReadTextFile

    }
    
    //let cls = {
    //    [Number(ACTION_TYPE.BASE)]: ActionBase
    //    , [Number(ACTION_TYPE.TIMES)]: ActionTimes
    //    , [Number(ACTION_TYPE.INTERVAL)]: ActionInterval
    //    , [Number(ACTION_TYPE.HTTP_REQ)]: ActionHttp
    //    , [Number(ACTION_TYPE.HTTP_FAILED_STORE)]: 
    //    , [Number(ACTION_TYPE.STORE_SINGLE)]: ActionStoreSingle
    //    , [Number(ACTION_TYPE.FILTER_ATTR)]: ActionFilterAttr
    //    , [Number(ACTION_TYPE.FILTER_TEXT)]: ActionFilterText
    //    , [Number(ACTION_TYPE.TEXT_TRANS)]: ActionTextTrans
    //    , [Number(ACTION_TYPE.TRAVEL_LINKS)]: ActionTravelLinks
    //    , [Number(ACTION_TYPE.WRITE_TXT_FILE)]: ActionWriteTextFile


    //}


	//let clsstr ={
	//	[Number(ACTION_TYPE.BASE)]: "BASE"
	//	,[Number(ACTION_TYPE.TIMES)]: "TIMES"
	//	,[Number(ACTION_TYPE.INTERVAL)]: "INTERVAL"
	//	,[Number(ACTION_TYPE.HTTP_REQ)]:"HTTP_REQ"
	//	,[Number(ACTION_TYPE.HTTP_FAILED_STORE)]:"HTTP_FAILED_STORE"
	//	,[Number(ACTION_TYPE.STORE_SINGLE )]:"STORE_SINGLE"
	//	,[Number(ACTION_TYPE.FILTER_ATTR)]:"FILTER_ATTR"
	//	,[Number(ACTION_TYPE.FILTER_TEXT)]:"FILTER_TEXT"
	//	,[Number(ACTION_TYPE.TEXT_TRANS)]:"TEXT_TRANS"
	//	,[Number(ACTION_TYPE.TRAVEL_LINKS)]:"TRAVEL_LINKS"
	//	,[Number(ACTION_TYPE.WRITE_TXT_FILE)]:"WRITE_TXT_FILE"
	//}


	BLUE.log("try create cls["+Conf.TP+"] id["+Conf.id+"]");	
	if (cls[Conf.TP])
	{
		return  new cls[Conf.TP](pdata,localinfo,ab,Conf, holder,Level+1);
	}
	BLUE.error("*** create cls["+Conf.TP+"] failed");	
	return null;	
}



    //@  $,cheerio 根实例 function 
    //@op 操作 cheerio 元素,object
    //@sels 
    export function selectDom($:any, op:any, sels: string[]): any[] {
        let len = sels.length;
        if (len <= 0) {
            BLUE.error("selectDom error");
            return [];
        }
        let res;
        let idx = 0;

        //是$则把第一个sel选取出来,否则把 op操作对像转为数组
        //if ( op.load != null){
        //    //op === $
        //    res= $(sels[0]);
        //    idx = 1;
        //}
        //else{
        //    res = [op];
        //}

        let res_ary = [];
        for (let i = idx; i < len; i++) {
            let sel = sels[i];
            if (i==0)
            {
                let firstsel = $(sel);
                //if (!Array.isArray(firstsel )){
                    res_ary = [...firstsel]
                //}
                //res_ary = [$(sel)];
                continue;
            }

            res_ary = findhandle($,res_ary,sel);
            if (res_ary.length <=0 )
            {
                BLUE.error("selectDom no selected");
                return [];
            }
        }
        //return res_ary.length ==1 ? res_ary[0] : res_ary;
        return res_ary;
    }
    function findhandle($:any,res_ary:any,sel_key:string)
    {
        let new_res_ary: any[] = [];
        for (let j = 0; j < res_ary.length; j++) {
            let res = res_ary[j];
            let r = $(res).find(sel_key);
            if (r.length > 0) {
                for (let h = 0; h < r.length; h++) {
                    new_res_ary.push(r[h]);
                }
            }
        }
        return new_res_ary;
    }


    export function SetDataByKey(data:any,key:string, v:any):void
    {
        let store: any = data;
        let dir =  key;
        let props = dir.split(".");
        let s = store;
        for (let i = 0; i < props.length - 1; i++) {
            let prop = props[i];
            if (prop =="") continue;
            if (!s[prop]) {
                s[prop] = {}
                //s[prop] = {k:"",v:null,kinfo:null}
            }
            s = s[prop]
        }
        let k = dir.substring(dir.lastIndexOf(".") + 1)
        s[k] =v;
    }
    export function GetDataByKey(data:any,key:string):any
    {
        let store:any = data;
        let dir =  key;
        let props = dir.split(".");
        let s = store;
        for (let i = 0; i < props.length - 1; i++) {
            let prop = props[i];
            if (prop =="") continue;
            if (!s[prop]) {
                return null; 
            }
            s = s[prop]
        }
        let k = dir.substring(dir.lastIndexOf(".") + 1)
        return s[k];
        //return this.m_processdata[key];
    }
