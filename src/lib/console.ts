import { clearLine, moveCursor } from "readline";
import type { MsgWMParsed } from "./parser";

const colorCode = {
    green: "\x1b[32m",
    magenta: "\x1b[35m",
    blue: "\x1b[34m",
    red: "\x1b[41m",
    yellow: "\x1b[43m"
};
const colorEndCode = "\x1b[0m";
export function logColor(color: keyof typeof colorCode, ...text: (string | number)[]) {
    console.log(`${colorCode[color]}${text.join("")}${colorEndCode}`);
}
export function warpColor(color: keyof typeof colorCode, ...text: (string | number)[]) {
    return `${colorCode[color]}${text.join("")}${colorEndCode}`;
}
const numSpace = (num: number, range: number) => {
    return `${num}${new Array(range - num.toString().length+1).join(" ")}`;
}
const preNumSpace = (num: number, range: number) => {
    return `${new Array(range - num.toString().length+1).join(" ")}${num}`;
}


type WorkerStatus = "working" | "online" | "exit" | "created";
export type ParsedDetails = { struct: string[],enum:string[],union:string[],alias:string[],funcPointer:string[],handle:string[],macro:string[],macroFunc:string[],command:string[] };
type WorkerProgress = { parsed: number, total: number,ob:number,obParsed:number, status: WorkerStatus, parsedDetails: ParsedDetails };
export class Progress {
    workers!: WorkerProgress[];
    progressLine = 1;
    isNeedToPrint = false;
    isNeedToStop = false;
    stopCallback!:()=>void;
    bufferMessage = "";
    interVal!: ReturnType<typeof setInterval>;
    static create(noOfWorkers: number): Progress {
        const retObj = new Progress();
        retObj.progressLine += noOfWorkers;
        retObj.workers = new Array(noOfWorkers);
        for (let counter = 0; counter < noOfWorkers; counter++) {
            retObj.workers[counter] = { total: 0, parsed: 0,ob:0,obParsed:0, status: "created", parsedDetails: { struct: [],union:[],enum:[],alias:[],funcPointer:[],handle:[],macro:[],macroFunc:[],command:[] } };
        }
        retObj.interVal = setInterval(retObj.onInterval.bind(retObj), 1000);
        console.log(retObj.showProgress());
        return retObj;
    }
    static log(color: keyof typeof colorCode, ...message: string[]) {
        console.log(`${colorCode[color]}${message.join("")}${colorEndCode}\n`);
    }
    setStatus(workerId: number, status: WorkerStatus) {
        this.workers[workerId].status = status;
        this.print();
    }
    setParserStatus(workerId: number, data: MsgWMParsed) {
        const worker = this.workers[workerId];
        worker.total = data.total;
        worker.parsed = data.parsed;
        worker.parsedDetails = data.parsedDetails;
        worker.ob=data.ob;
        worker.obParsed=data.obParsed;
        this.print();
    }
    print(color?: keyof typeof colorCode, ...message: string[]) {
        this.isNeedToPrint = true;
        if (color) this.bufferMessage += `${colorCode[color]}${message.join("")}${colorEndCode}\n`;
    }
    async #realPrint() {
        for (let counter = 0; counter < this.progressLine; counter++) {
            // process.stdout.moveCursor(0, -1);
            // process.stdout.clearLine(0);
            await new Promise(resolv=>{
                moveCursor(process.stdout,0,-1,resolv as ()=>void);
            });
            await new Promise(resolv=>{
                clearLine(process.stdout,0,resolv as ()=>void);
            });
        }
        if (this.isNeedToPrint && this.bufferMessage != "") console.log(this.bufferMessage);
        console.log(this.showProgress());
    }
    showProgress() {
        let returnMsg = "";
        let noOfTotal = 0;
        let noOfParsed = 0;
        let noOfOB=0;
        let noOfOBParsed=0;
        let noOfSturct = 0;
        let noOfUnion = 0;
        let noOfEnum = 0;
        let noOfAlias = 0;
        let noOfFuncPointer = 0;
        let noOfHandle = 0;
        let noOfMacro = 0;
        let noOfMacroFunc = 0;
        let noOfCommand = 0;
        for (let workerId = 0; workerId < this.workers.length; workerId++) {
            const worker = this.workers[workerId];
            noOfTotal += worker.total;
            noOfParsed += worker.parsed;
            noOfOB+=worker.ob;
            noOfOBParsed+=worker.obParsed;
            noOfSturct += worker.parsedDetails.struct.length;
            noOfUnion+=worker.parsedDetails.union.length;
            noOfEnum+=worker.parsedDetails.enum.length;
            noOfAlias+=worker.parsedDetails.alias.length;
            noOfFuncPointer+=worker.parsedDetails.funcPointer.length;
            noOfHandle+=worker.parsedDetails.handle.length;
            noOfMacro+=worker.parsedDetails.macro.length;
            noOfMacroFunc+=worker.parsedDetails.macroFunc.length;
            noOfCommand+=worker.parsedDetails.command.length;
            let status: string;
            switch (worker.status) {
                case "working": {
                    status = `${warpColor("yellow", worker.status)} `;
                    break;
                }
                case "created": {
                    status = `${warpColor("yellow", worker.status)} `;
                    break;
                }
                case "online": {
                    status = `${warpColor("green", worker.status)}  `;
                    break;
                }
                case "exit": {
                    status = `${warpColor("red", worker.status)}    `;
                    break;
                }
            }
            const workerIdTxt = `worker:${warpColor("green", workerId)}${workerId > 9 ? " " : "  "}`;
            const parsedTxt = `HTML:${warpColor("blue", preNumSpace(worker.total, 8))}/${warpColor("blue", preNumSpace(worker.parsed, 8))} ${warpColor("yellow","|")} Openblock:${warpColor("blue", numSpace(worker.ob, 4))}/${warpColor("blue", numSpace(worker.obParsed, 4))}`;
            const parsedTypeTxt = `S:${warpColor("magenta", numSpace(worker.parsedDetails.struct.length,4))}, U:${warpColor("magenta", numSpace(worker.parsedDetails.union.length,4))}, E:${warpColor("magenta", numSpace(worker.parsedDetails.enum.length,4))}, A:${warpColor("magenta", numSpace(worker.parsedDetails.alias.length,4))}, FP:${warpColor("magenta", numSpace(worker.parsedDetails.funcPointer.length,4))}, H:${warpColor("magenta", numSpace(worker.parsedDetails.handle.length,4))}, M:${warpColor("magenta", numSpace(worker.parsedDetails.macro.length,4))}, MF:${warpColor("magenta", numSpace(worker.parsedDetails.macroFunc.length,4))}, C:${warpColor("magenta", numSpace(worker.parsedDetails.command.length,4))}`;
            returnMsg += `${workerIdTxt}/ ${status}${warpColor("yellow","|")} ${parsedTxt} ${warpColor("yellow","|")} ${parsedTypeTxt}\n`;
        }
        const totalParsedTypeTxt = `Overall Status ------ HTML:${warpColor("blue", preNumSpace(noOfTotal, 8))}/${warpColor("blue", preNumSpace(noOfParsed, 8))} ${warpColor("yellow","|")} Openblock:${warpColor("blue", numSpace(noOfOB,4))}/${warpColor("blue", numSpace(noOfOBParsed,4))} ${warpColor("yellow","|")} S:${warpColor("blue", numSpace(noOfSturct, 4))}, U:${warpColor("blue", numSpace(noOfUnion, 4))}, E:${warpColor("blue", numSpace(noOfEnum, 4))}, A:${warpColor("blue", numSpace(noOfAlias, 4))}, FP:${warpColor("blue", numSpace(noOfFuncPointer, 4))}, H:${warpColor("blue", numSpace(noOfHandle, 4))}, M:${warpColor("blue", numSpace(noOfMacro, 4))}, MF:${warpColor("blue", numSpace(noOfMacroFunc, 4))}, C:${warpColor("blue", numSpace(noOfCommand, 4))}`
        return `${returnMsg}${totalParsedTypeTxt}`;
    }
    async onInterval() {
        if (this.isNeedToPrint === true) {
            await this.#realPrint();
            this.bufferMessage = "";
            this.isNeedToPrint = false;
            if (this.isNeedToStop){
                clearInterval(this.interVal);
                this.stopCallback();
            } 
        }
    }
    async stop():Promise<void> {
        if(this.isNeedToStop) return;
        this.isNeedToStop = true;
        new Promise((resolv)=>{
            this.stopCallback=resolv as Progress["stopCallback"];
        })
    }
}