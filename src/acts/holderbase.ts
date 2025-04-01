import * as BLUE from '../utils';
import * as _actions from "./_actions";
    export class ActionHolderBase {
        private m_processdata: any = {};
        constructor() {
        }
        public OnAIEnd() {
            BLUE.log(" end !!!!!!!!!!!!!!!!")            
        }
        public getData(): any {

            return this.m_processdata;
        }
        //public SetProcessDataByKey(key:string, v:{k:string,v:any,kinfo:any}):void
        //{
        //    _actions.SetDataByKey(this.m_processdata,key,v);
        //}
        //public GetProcessDataByKey(key:string):any
        //{
        //    return _actions.GetDataByKey(this.m_processdata,key);
        //}

    };
