import * as BLUE from '../utils';
import * as _actions from "./_actions";
import { ActionBase } from './actionbase';
    export class ActionHolderBase {
        private m_processdata: any = {};
        private m_callback:any;
        private m_acts:ActionBase[] = [];
        constructor(cb:any) {
            this.m_callback = cb;
        }
        public OnActionEnd(act:ActionBase) {
            //BLUE.log(" end !!!!!!!!!!!!!!!!")     
            let self = this; 
            if (self.m_acts.length<=0){
                console.log(" end  error!");
                return;
            }
            let top = self.m_acts.length - 1;
            if (self.m_acts[top] !== act){
                console.log(" end  action error!");
                return;
            }

            self.m_acts.pop();

            if (self.m_acts.length<=0 && self.m_callback){
                self.m_callback();
            } 



        }
        
        public AddAct(act:ActionBase|null): any {
            if (!act){
                console.log(" add action error!");
                return;
            }
            this.m_acts.push(act);
        }

        public Update(tm:number): any {
            let self = this;
            let top = self.m_acts.length - 1;
            if (top<0){
                return;
            }
            self.m_acts[top].Update(tm); 
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
