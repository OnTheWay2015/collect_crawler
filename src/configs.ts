export const DEBUG_PRINT_PAGE_CONTENT:boolean = false;



export const DB_IP:string="127.0.0.1";
export const DB_BASE:string="DB_BASE";
export const DB_COL_GRADES:string="GRADES";
export const DB_COL_KINDS:string="KINDS";
export const DB_COL_EXERCISES:string="EXERCISES";


export const CFG_NODE_PROCESS_CNT:number= 40;
export const CFG_NODE_PROCESS_LIMIT_CNT:number= 3;
export const CFG_HTTP_RETRY_CNT:number= 40;

export const HTTP_EXPIRE_TM:number=30000;

export let FILE_DIR_ROOT: string = "./ttt";

export function setFileDirRoot(path: string) {
    FILE_DIR_ROOT = path;
}


export enum HEADER_TAG {
    PAGE= "PAGE" 
    ,AJAX= "AJAX" 
}
export enum NODE_TAG {
    ROOT = "ROOT" ,
    STEP_CATALOG = "STEP_CATALOG",//对应每个目录项处理
    STEP_CATALOG_PAGE = "STEP_CATALOG_PAGE",//对应目录页处理
    STEP_PAGE = "STEP_PAGE",//对应选中页处理
    STEP_FILE_BASE= "STEP_FILE",//FileBase
    
    STEP_FILE_M4A = "STEP_FILE_M4A",//FileM4A

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
