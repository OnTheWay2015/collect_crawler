import { ActionBase, ActionState, ExecState } from "./actionbase";

export class ActionInterval extends ActionBase
{
    private m_t :number = 0;
    private m_tlimit :number = 0;
    constructor(pdata:any,localinfo:any,Parent:ActionBase|null,conf:any, holder:any,level:number)
    {
        super(pdata,localinfo,Parent,conf, holder,level);
    }


protected override Prepare():void
{
    let self = this;
   if ( self.m_pAIActionConfig.TargetValue.length <1||     
        self.m_pAIActionConfig.TargetValue[0].length <1)
    {
        self.Errorlog("no TargetValue");
        self.Done(ExecState.FAILED);
        return;
    }    
	//m_CheckTimer.SaveTime();
	//m_TargetValue = { AICONDITION_TYPE::P_INTERVAL,m_pAIActionConfig.TargetValue[0].Values[0] };
    self.m_tlimit = self.m_pAIActionConfig.TargetValue[0][0];
    self.GoState(ActionState.WAITING);
	//m_State = WAITING ;
}

protected override Waiting(tm:number):void
{
    let self = this;
    self.m_t += tm;
	if (self.m_t < self.m_tlimit)
	{
		return;
	}

    self.GoState(ActionState.END);
	//GoChoseTask(ExecState::OK);
}



};
