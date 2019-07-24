
export interface TaskIF{
    update(tm:number):void;
}

export class Task implements TaskIF{
    constructor(){
    }

    public update(tm:number):void{
    }
}

export class TaskUrl extends Task{
    constructor(){
        super();
    }
}