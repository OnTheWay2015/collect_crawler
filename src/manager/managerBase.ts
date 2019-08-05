import { main } from "../main";
export interface ManagerBaseIF {
    pHolder:main
    init(data?:any,cb?:(res:number)=>void): void;
}

//(x:string,y:number)=>string