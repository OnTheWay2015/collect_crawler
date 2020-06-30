   import * as BLUE from "./../utils"; 
   import {ManagerBaseIF}  from "./managerBase"; 
import { main } from "../main";
   export interface ProcessIF {
            update(tm:number):void;
            readonly tagName:string;
    }
    export class ProcessManager implements  ManagerBaseIF{
        public pHolder!:main;
        private _tableStore!:{[key:string]:ProcessIF}; 
        private _vec!:ProcessIF[];
        constructor(holder:main) { 
            let self = this;
            self._tableStore = {};
            self._vec = [];
            self.pHolder = holder;
        }
        //let map:{[key:number] : Student} = {};
        public addProcess(ps: ProcessIF): void {
            let self = this;
            if (self._tableStore[ps.tagName] != null) {
                BLUE.notice("addProcess  name[" + name + "] exsit! reset");
            }
            self._tableStore[ps.tagName] = ps;
            self._vec.push(ps);
        }

        public rmvProcess(ps:ProcessIF):void {
            let self = this;
            if (self._tableStore[ps.tagName] == null) {
                BLUE.notice("rmvProcess  name[" + name + "]not exsit! reset");
                return;
            }
            delete self._tableStore[ps.tagName];
            for (let i=0; i<self._vec.length;i++)
            {
                let proc:ProcessIF = self._vec[i];
                if (proc.tagName == ps.tagName){
                    self._vec.splice(i,1);
                    break;
                }
            }            
        }
        public init(cb?:(res:number)=>void){

        }

        public start(){
            setInterval(this.process.bind(this), 333);
        }

        private process(tm:number){
            let self = this;
            for (let i=0; i<self._vec.length;i++)
            {
                let proc:ProcessIF = self._vec[i];
                proc.update.call(proc,tm); 
            }            
        }


    }

