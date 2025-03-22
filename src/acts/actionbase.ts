import { randomInt } from "crypto";
import { ConfMgr } from "../conf";
import * as BLUE from '../utils';
import { ActionTimes } from "./actiontimes";
import { ActionInterval } from "./actioninterval";
import { MakeAction } from "./_actions";


export enum ACTION_TYPE{
	BASE =1,
	TIMES,
	INTERVAL,
};

export enum ACTION_EXEC_TYPE {
	RANDOM = 1,
	PARALLEL,
}
export enum ExecState{
    OK = 1,
    FAILED = 2,
    WAITE = 3,
};

export enum ActionState {
    NONE = 1,
    START,
	CHOISE_TASK,
	RUN,
	WAITING_TASK,
    TRY_SUB_NODE,
    WAITING_SUB,
    WAITING_DRIVER,
    WAITING,
    END,
};





export type AIACTION_CONFIG = {
	id: number; 
	TP: ACTION_TYPE;
	//ActionID: number = 0;//引用 AIACTION_CONFIG.id 
	ExecTP:ACTION_EXEC_TYPE;
	Actions: [number]; //引用 AIACTION_CONFIG.id 
	NodeLeft:number; //当前执行后,返回 	ExecState.FAILED  时选择
	NodeRight:number; //当前执行后,返回 	ExecState.OK 时选择	
	TargetValue:number[][];
};


export class ActionBase {
	private m_State:ActionState = ActionState.NONE;
	private m_pCurr:ActionBase|null = null;
	private m_ExecRes:ExecState = ExecState.OK;
	private m_pParent:ActionBase|null =null;
	private m_Holder!:any;
	protected m_TaskposCurr:number=0;
	protected m_Level:number=0;
	protected m_pAIActionConfig!:AIACTION_CONFIG;
    constructor(Parent:ActionBase|null,conf:any, holder:any,level:number)
    {
		let self = this;
		self.m_pParent = Parent;
		self.m_pAIActionConfig = conf;
		self.m_Level = level;
		self.m_Holder = holder;
    }


/*	
    AIDriverParams m_TargetValue;
    CEasyTimer	m_TimeCost;
*/
    public Update(tm:number) {
        let self = this;
        switch (self.m_State) {
            case ActionState.NONE:
                return;
                break;
            case ActionState.START:
                self.DoPrepare();
                break;
            case ActionState.RUN:
                self.DoRun();
                break;
            case ActionState.CHOISE_TASK:
                self.DoChoseTask();
                break;
            case ActionState.TRY_SUB_NODE: // CHOISE_TASK 执行完后,按 res 执行左或者右结点
                self.DoTrySubNode();
                break;
            case ActionState.WAITING_TASK:
                break;
            case ActionState.WAITING_SUB:
                break;
            case ActionState.WAITING_DRIVER:
                {
                    //if (m_TimeCost.IsTimeOut(15 * 1000)) {
                    //    Log("TP:[%d] ActionID[%d] WAITING_DRIVER time expire", m_pAIActionConfig.TP, m_pAIActionConfig.ActionID);
                    //    Done(ExecState:: FAILED);
                    //}
                }
                break;
            case ActionState.WAITING:
                self.DoWaiting(tm);
                break;
            case ActionState.END:
                {
                    //Log("---->END TP:[%d] ID[%d]", m_pAIActionConfig.TP,m_pAIActionConfig.ActionID);
                    self.DoEnd();
                    return;
                }
                break;
            default:
                //Log("State err[ %d] Level:[%d] ", m_State,m_Level);
                break;
        }
        if (self.m_pCurr) {
            self.m_pCurr.Update(tm);
        }
    }


	public DoPrepare() {
		//LogDebug("ActionBase::DoPrepare Level:[%d] ",m_Level );
		let self = this;
		this.m_State = ActionState.RUN;
		if (self.m_pAIActionConfig == null || self.m_pAIActionConfig.TP <= 0) {
			self.Done(ExecState.FAILED);
			return;
		}

		if (!self.m_pAIActionConfig.TargetValue) {
			self.Errorlog("TargetValue is null");
			self.Done(ExecState.FAILED);
			return;

		}

		self.Prepare();
	}

	protected Prepare() {
		//let self = this;
	}



public DoRun()
{
	//LogDebug("ActionBase.DoRun Level:[%d] ",m_Level );
    let self = this;
	let r = self.Run();
	self.setExecRes(r);

	if (self.m_ExecRes == ExecState.FAILED)
	{
		self.GoState( ActionState.TRY_SUB_NODE);
	}
	else if (self.m_ExecRes == ExecState.OK)
	{
		self.GoState( ActionState.CHOISE_TASK);
	}
	else if (self.m_ExecRes == ExecState.WAITE)
	{
        self.GoState( ActionState.WAITING_DRIVER);
        //self.m_TimeCost.SaveTime();
	}
	else
	{
		//Log("ExecState err [%d]",self.m_ExecRes);
		self.GoState( ActionState.END);
	}
}

protected Run():ExecState  
{
	return ExecState.OK;
}




public DoChoseTask()
{
    let self = this;
	let Count:number= self.m_pAIActionConfig.Actions.length;
	if (Count <= 0)
	{
		self.GoState( ActionState.TRY_SUB_NODE);
		return ;
	}
	
	let ActionConfId:number = 0;
	switch (self.m_pAIActionConfig.ExecTP)
	{
	case ACTION_EXEC_TYPE.RANDOM:
    {
        let Idx:number = randomInt(0, Count);
        ActionConfId = self.m_pAIActionConfig.Actions[Idx];
        //self.m_TaskposCurr++;
    }
	break;
	case ACTION_EXEC_TYPE.PARALLEL:
			{
				if (self.m_TaskposCurr < Count) {
					ActionConfId = self.m_pAIActionConfig.Actions[self.m_TaskposCurr++];
				} else {
					self.GoState( ActionState.TRY_SUB_NODE);
					return;
				}
			}
	break;
	default:
		//Log("ACTION err_ExecTP[%d] , AIActionConfig ID:%d", self.m_pAIActionConfig.ExecTP,self.m_pAIActionConfig.ActionID);
		break;
	}
	
	let Conf = ConfMgr.GetActionConfigById(ActionConfId);
	if (Conf == null)
	{
		BLUE.error("ActionConfId["+ ActionConfId +"] is null!" );
		self.GoState( ActionState.TRY_SUB_NODE);
		return;
	}
	if (Conf.TP<=0)
	{
		self.GoState( ActionState.TRY_SUB_NODE);
		return ;
	}

	self.m_pCurr = self.Create(Conf);

	if (!self.m_pCurr)
	{
		self.Done(self.m_ExecRes);
		return;
	}

	self.m_pCurr.StartActionConfig();
	self.GoState( ActionState.WAITING_TASK);
}

public DoTrySubNode()
{
    let self = this;
	//LogDebug("ActionBase.DoTrySubNode Level:[%d] ",self.m_Level );
	let ActionConfId = self.m_pAIActionConfig.NodeLeft;//FAILED
	if (self.m_ExecRes == ExecState.OK)
	{
		ActionConfId = self.m_pAIActionConfig.NodeLeft;
	}
	
	if (ActionConfId <= 0) {
		self.Done(self.m_ExecRes);
		return;
	}
	
	let Conf = ConfMgr.GetActionConfigById(ActionConfId);
	if (Conf == null)
	{
		BLUE.error("ActionConfId["+ ActionConfId +"] is null!" );
		self.Done( ExecState.FAILED );
		return;
	}

	//if (Conf.TP<=0)
	//{
	//	////LogDebug("ActionBase.DoTrySubNode ExecState(%d) no config!",self.m_ExecRes);
	//	self.Done(self.m_ExecRes);
	//	return ;
	//}
	
	self.m_pCurr =self.Create(Conf);

	if (!self.m_pCurr)
	{
		//Log("ActionBase.DoTrySubNode ACTION create failed TP: %d, AIActionConfig ID:%d,ExecState(%d) level[%d]", Conf.TP,self.m_pAIActionConfig.ActionID,self.m_ExecRes,self.m_Level);
		self.Done(ExecState.FAILED);
		return;
	}

	//self.m_IsSubNode = true;
	self.m_pCurr.StartActionConfig();
	self.GoState( ActionState.WAITING_SUB);
}
public StartActionConfig() 
{
	let self = this;
	if (self.m_pCurr)
	{
 		self.m_pCurr.Stop();	
		//SAFE_DELETE(self.m_pCurr);
	}

	self.GoState( ActionState.START);
	//Log("---->START TP:[%d] ID[%d]", Conf.TP,Conf.ActionID);
}


private Create(Conf:AIACTION_CONFIG):ActionBase|null 
{
	let self = this;
	return MakeAction(null, self,Conf,self.m_Level);
}


public DoWaiting(tm:number)
{
	let self = this;
	self.Waiting(tm);
}

protected Waiting(tm:number)
{
	let self = this;
	//m_State = END;
}


protected DoEnd()
{
	let self = this;
	//LogDebug("ActionBase::DoEnd Level:[%d] ",m_Level );
	self.GoState( ActionState.NONE);
	if (self.m_pParent == null)
	{
		//m_pHoldChar->AIEnd(m_ExecRes,m_pAIActionConfig.ActionID);
	}
	else
	{
		self.m_pParent.OnSubResult(self.m_ExecRes);
	}


}

public Done(res:ExecState)
{

	let self = this;
	self.SetExecRes(res);
	self.GoState(ActionState.END);
}


protected OnSubResult(res:ExecState )
{
	let self = this;
	//LogDebug("ActionBase::OnSubResult Level:[%d] Res[%d] IsSubNode[%d] ",m_Level,Res,m_IsSubNode );
	if (self.m_State != ActionState.WAITING_TASK)
	{
		//Log("ActionBase::OnSubResult State[%d] err!",m_State);
		self.Done(res);
		return;
	}

	if (res == ExecState.OK )
	{
		if (self.m_pAIActionConfig.ExecTP == ACTION_EXEC_TYPE.PARALLEL )
		{
			self.GoState( ActionState.CHOISE_TASK);
		}
		else
		{
			self.GoState( ActionState.TRY_SUB_NODE);
		}

	}
	else if(res == ExecState.FAILED)
	{
		self.setExecRes(ExecState.FAILED);
		self.GoState( ActionState.TRY_SUB_NODE);

	}
	else
	{
		self.Errorlog("ExecState["+res+"]");
	}
}

private Clear()
{
	let self =this;
	if (self.m_pCurr)
	{
 		self.m_pCurr.Stop();	
		//SAFE_DELETE(self.m_pCurr);
	}

	self.m_pParent = null;
	self.m_TaskposCurr = 0;
	self.GoState( ActionState.NONE);
	self.m_ExecRes = ExecState.OK;
	self.m_Level = 0;
	self.m_Holder = null;	

	//self.m_TargetValue = {};
}

public Stop() 
{ 
	this.Clear();
}

protected SetExecRes( res:ExecState )
{
	this.m_ExecRes = res;
}

public GoState( s : ActionState)
{
	let ActionStateStr = {
		[ActionState.NONE]: "NONE",
		[ActionState.START]: "START",
		[ActionState.CHOISE_TASK]: "CHOISE_TASK",
		[ActionState.RUN]: "RUN",
		[ActionState.WAITING_TASK]: "WAITING_TASK",
		[ActionState.TRY_SUB_NODE]: "TRY_SUB_NODE",
		[ActionState.WAITING_SUB]: "WAITING_SUB",
		[ActionState.WAITING_DRIVER]: "DRIVER",
		[ActionState.WAITING]: "WAITING",
		[ActionState.END]: "END",
	};



	let self = this;
	self.Errorlog(" GoState from [" + ActionStateStr[self.m_State] + "] to curr[" + ActionStateStr[s] + "]  ExecRes:" + self.m_ExecRes);
	self.m_State = s;
}


protected getState():ActionState
{
	return this.m_State;
}


protected setExecRes(res:ExecState)
{
	this.m_ExecRes = res;
	this.Errorlog("setExecRes["+res+"]");
}
protected getExecRes():ExecState
{
	return this.m_ExecRes;
}

protected Errorlog(str:string):void
{

	let self = this;
	let pRootConfig = self.GetRootConfig();
	BLUE.error("ERR ==>RootActionid["+pRootConfig.id+"] id["+self.m_pAIActionConfig.id+"] Level:["+self.m_Level+"] ");
	BLUE.error(str);
}

protected GetRootConfig():AIACTION_CONFIG
{
	let self = this;	
	let p:ActionBase = self;
	while (p.m_pParent)
	{
		p = p.m_pParent;
	}
	return p.m_pAIActionConfig;
}
};


