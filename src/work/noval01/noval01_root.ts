import * as constants from "../../constants";
import { BlueNode} from "../../collects/node";
import * as cheerio from 'cheerio';
import * as BLUE from '../../utils';
import * as PATH from 'path';



export class noval01_Root extends BlueNode {
    //@ res HTTP.IncomingMessage
    protected onRequestRes(data: any, res: any): void {
        let urls:any = [
            ""
            //,"https://www.qu04.cc/book/40769/" //官神
            //,"https://www.qu04.cc/book/39854/" //这游戏也太真实了
            //,"https://www.qu04.cc/book/10894/" //大完美主播
            //,"https://www.qu04.cc/book/56134/" //开局奖励满级神功
            //,"https://www.qu04.cc/book/46370/" //亏成首富从游戏开始
            //,"https://www.qu04.cc/book/46150/" //大医凌然
            //,"https://www.qu04.cc/book/163836/" //白衣披甲
            //,"https://www.qu04.cc/book/46234/" //手术直播间
            ,"https://www.qu04.cc/book/181205/" //这主播真狗，挣够200就下播
            //,"https://www.qu04.cc/book/39544/" //这个明星很想退休
            //,"https://www.qu04.cc/book/138647/" //陈医生，别怂
            //,"https://www.qu04.cc/book/45048/" //全职艺术家
            ,"" //
            ,"" //
            ,"" //
            ,"" //
            ,"" //
            ,"" //
	//,"https://www.qu04.cc/book/179862/" //命令与征服
	//,"https://www.qu04.cc/book/39882/" //诸界第一因
	//,"https://www.qu04.cc/book/180243/" //阵问长生
	//,"https://www.qu04.cc/book/172021/" //这个影帝只想考证
	//,"https://www.qu04.cc/book/181066/" //谁让他修仙的
        ];
        let self = this;
        for (var i = 0; i < urls.length; i++) {
            if (urls[i] == "" ) continue;
            self.addSubNode(
                constants.NODE_TAG.STEP_CATALOG,
                urls[i],
                {},
                self.mRootData);
        }

    }
}
 