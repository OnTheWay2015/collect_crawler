export interface ManagerBaseIF {
    pHolder:any; //appmain
    init(cb?:(res:number)=>void): void;
}

//(x:string,y:number)=>string