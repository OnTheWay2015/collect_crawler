
export const DB_IP:string="127.0.0.1";
export const DB_BASE:string="DB_BASE";
export const DB_COL_GRADES:string="GRADES";
export const DB_COL_KINDS:string="KINDS";
export const DB_COL_EXERCISES:string="EXERCISES";


export const CFG_NODE_PROCESS_CNT:number= 40;
export const CFG_NODE_PROCESS_LIMIT_CNT:number= 1;
export const CFG_HTTP_RETRY_CNT:number= 4;

export const HTTP_EXPIRE_TM:number=30000;

export let FILE_DIR_ROOT: string = "./ttt";

export function setFileDirRoot(path: string) {
    FILE_DIR_ROOT = path;
}


export enum NODE_TAG {
    ROOT = "ROOT" ,
    STEP_1 = "STEP_1",
    STEP_10 = "STEP_10",
    STEP_2 = "STEP_2",
    STEP_3 = "STEP_3",
    STEP_4 = "STEP_4",//page
    STEP_5 = "STEP_5",//DownLoadPage
    STEP_100 = "STEP_100",//FileImage
    STEP_200 = "STEP_200",//FileTorrent
    STEP_300 = "STEP_300",//FileM4A
}
