import { AIACTION_CONFIG } from "./acts/actionbase";
import * as BLUE from "./utils"; 
import * as FS from 'fs';

class ConfManager {
    constructor() {
    }

    private m_conf:any;
    private m_confActions:any={};
    public init(cb?: (res: number) => void) {
        let self = this;
        const currentPath = FS.realpathSync('.');
        //let p = currentPath + "/configs/config.json"
        let p = "./configs/config.json"
        let data = FS.readFileSync(p, { encoding: 'utf8' });
        self.m_conf = JSON.parse(data);
        //BLUE.log(self.m_conf);
        if (self.m_conf["actions"]) {
            self.m_conf["actions"].forEach((conf: any) => {
                if (conf == null) return;
                self.m_confActions[conf.id] = conf;
            });
        }

    }

 



    public GetActionConfigById(id:number):AIACTION_CONFIG|null
    {
        let self = this;
        return self.m_confActions[id];
    }

};

export let ConfMgr = new ConfManager(); 
