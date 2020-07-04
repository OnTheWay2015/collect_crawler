import { main } from "../main";
export interface ManagerBaseIF {
    pHolder:main
    init(cb?:(res:number)=>void): void;
}

//(x:string,y:number)=>string