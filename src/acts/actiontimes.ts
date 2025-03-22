import { ACTION_EXEC_TYPE, ActionBase, ActionState, ExecState } from "./actionbase";

export class ActionTimes extends ActionBase
{
    private m_tlimit:number = 0;
    private m_RunTimes:number = 0;
    constructor(Parent:ActionBase|null,conf:any, holder:any,level:number)
    {
        super(Parent,conf, holder,level);
    }


protected override Prepare():void
{
    let self = this;
   if (self.m_pAIActionConfig.TargetValue.length <=0||     
        self.m_pAIActionConfig.TargetValue[0].length <=0  )
    {
        self.Errorlog("no TargetValue");
        self.Done(ExecState.FAILED);
        return;
    }    
    self.m_tlimit = self.m_pAIActionConfig.TargetValue[0][0];
    self.GoState(ActionState.CHOISE_TASK);
}


protected override OnSubResult(res:ExecState )
{

	let self = this;
	if (self.getState()!= ActionState.WAITING_TASK)
	{
		self.Done(res);
		return;
	}

	if (res != ExecState.OK )
	{
        self.SetExecRes(res);
		self.GoState( ActionState.TRY_SUB_NODE);
        return;
    }

	if(self.m_pAIActionConfig.ExecTP == ACTION_EXEC_TYPE.RANDOM)
	{
		self.m_RunTimes++;
	}
	else if ( ACTION_EXEC_TYPE.PARALLEL == self.m_pAIActionConfig.ExecTP)
	{
		if (self.m_TaskposCurr >= self.m_pAIActionConfig.Actions.length)
		{
			self.m_TaskposCurr = 0;
			self.m_RunTimes++;
		}
	}
    else
    {
        self.Errorlog(" m_pAIActionConfig.ExecTP err value["+self.m_pAIActionConfig.ExecTP+"]");
    }

	if (self.m_RunTimes< self.m_tlimit)
	{
        self.GoState(ActionState.CHOISE_TASK);
	}
    else
    {
        self.GoState(ActionState.TRY_SUB_NODE);
    }
}

};
