import * as BLUE from '../utils';
import { ACTION_TYPE, ActionBase, AIACTION_CONFIG } from "./actionbase";
import { ActionInterval } from "./actioninterval";
import { ActionTimes } from "./actiontimes";


//===================================================
export function MakeAction(holder:any, ab:ActionBase|null,Conf:AIACTION_CONFIG,Level:number):ActionBase|null
{
	//SAFE_DELETE(self.m_self.pCurr);
	//ActionBase* self.pCurr = nullptr;
	let cls ={
		[Number(ACTION_TYPE.BASE)]: ActionBase
		,[Number(ACTION_TYPE.TIMES)]:ActionTimes
		,[Number(ACTION_TYPE.INTERVAL)]:ActionInterval
	}


	let clsstr ={
		[Number(ACTION_TYPE.BASE)]: "BASE"
		,[Number(ACTION_TYPE.TIMES)]: "TIMES"
		,[Number(ACTION_TYPE.INTERVAL)]: "INTERVAL"
	}


	BLUE.log("try create cls["+clsstr[Conf.TP]+"]");	

	if (cls[Conf.TP])
	{
		return  new cls[Conf.TP](ab,Conf, holder,Level+1);
	}
	BLUE.error("*** create cls["+clsstr[Conf.TP]+"] failed");	
	return null;	
}