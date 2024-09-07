import { workerData, Worker } from "worker_threads";
import { Progress, type ParsedDetails } from "./console";
import { readFile, writeFile } from "fs/promises";
import type { ReportedKnownData } from "../parser-worker/openblock-types";

export type MsgWMParsed = { type: "parsed", total: number, parsed: number, ob: number, obParsed: number, parsedDetails: ParsedDetails };
export type MsgWMCompleted = { type: "completed", parsed: MsgWMParsed, unknownSect1Class: string[], unknownSect2Class: string[], unknownSect3Class: string[], unknownSect4Class: string[], unknownOBClass: string[], unknownLBClass: string[], reportedKnownData: ReportedKnownData };
type MsgWM = MsgWMParsed | MsgWMCompleted | { type: "working" };
export type MsgMWJob = { type: "job", data: string[] };
export type MsgMW = MsgMWJob;
export type WKData = { id: number, gConfig: GlobalConfig };
export type GlobalObj = {
    progress: Progress
}
export type GlobalConfig = {
    cpu: number,
    noOfParsers: number,
    isDebug: boolean,
    debugRoot: string,
    cmdConfig: { [key: string]: string }
}

export function getConfig() {
    const config: { [key: string]: string } = {};
    const argv = process.argv;
    for (let counter = 2; counter < argv.length; counter++) {
        const param = argv[counter].split("=")
        config[param[0]] = param[1];
    }
    return config;
}
export function createBarrier(waitNo: number) {
    let readyWorker: { [key: number]: boolean } & { count: number } = { count: 0 };
    let readyResolve: (value: unknown) => void;
    let readyPromise = new Promise(resolv => { readyResolve = resolv });
    const remainedCb = (id: number, status: boolean) => {
        if (readyWorker[id] === undefined) {
            readyWorker.count++;
            readyWorker[id] = status;
            if (readyWorker.count === waitNo) {
                readyResolve(true);
            }
        } else {
            readyWorker[id] = status;
        }
    };
    return { promise: readyPromise, cb: remainedCb };
}
const debugUnknownClass = async (gConfig: GlobalConfig, parser: ParserWorker[], sectionLevel: 1 | 2 | 3 | 4) => {
    const unknownClass: string[] = [];
    const sectionLevelStr = `unknownSect${sectionLevel}Class`;
    parser.forEach(wk => {
        const parserUnknownClass = wk[`unknownSect${sectionLevel}Class`];
        if (parserUnknownClass && parserUnknownClass.length > 0) {
            parserUnknownClass.forEach(className => {
                if (unknownClass.indexOf(className) === -1) {
                    unknownClass.push(className);
                }
            })
        }
    })
    if (unknownClass.length > 0) await writeFile(`${gConfig.debugRoot}/${sectionLevelStr}.txt`, unknownClass.join(","));
}
const debugOBUnknownClass = async (gConfig: GlobalConfig, parser: ParserWorker[]) => {
    const unknownClass: string[] = [];
    parser.forEach(wk => {
        const parserUnknownClass = wk.unknownOBClass;
        if (parserUnknownClass && parserUnknownClass.length > 0) {
            parserUnknownClass.forEach(className => {
                if (unknownClass.indexOf(className) === -1) {
                    unknownClass.push(className);
                }
            })
        }
    })
    if (unknownClass.length > 0) await writeFile(`${gConfig.debugRoot}/unknownOBClass.txt`, unknownClass.join(","));
}
const debugLBUnknownClass = async (gConfig: GlobalConfig, parser: ParserWorker[]) => {
    const unknownClass: string[] = [];
    parser.forEach(wk => {
        const parserUnknownClass = wk.unknownLBClass;
        if (parserUnknownClass && parserUnknownClass.length > 0) {
            parserUnknownClass.forEach(className => {
                if (unknownClass.indexOf(className) === -1) {
                    unknownClass.push(className);
                }
            })
        }
    })
    if (unknownClass.length > 0) await writeFile(`${gConfig.debugRoot}/unknownLBClass.txt`, unknownClass.join(","));
}
export const debugParsedDetails = async (gConfig: GlobalConfig, parser: ParserWorker[]) => {
    const parseDetails: ParsedDetails = structuredClone(parser[0].parseDetails);
    for (let parserCounter = 1; parserCounter < parser.length; parserCounter++) {
        const curParser = parser[parserCounter];
        parseDetails.struct = parseDetails.struct.concat(curParser.parseDetails.struct);
        parseDetails.union = parseDetails.union.concat(curParser.parseDetails.union);
        parseDetails.enum = parseDetails.enum.concat(curParser.parseDetails.enum);
        parseDetails.alias = parseDetails.alias.concat(curParser.parseDetails.alias);
        parseDetails.funcPointer = parseDetails.funcPointer.concat(curParser.parseDetails.funcPointer);
        parseDetails.handle = parseDetails.handle.concat(curParser.parseDetails.handle);
        parseDetails.macro = parseDetails.macro.concat(curParser.parseDetails.macro);
        parseDetails.macroFunc = parseDetails.macroFunc.concat(curParser.parseDetails.macroFunc);
        parseDetails.command = parseDetails.command.concat(curParser.parseDetails.command);
    }
    for (const [arrName, arr] of Object.entries(parseDetails)) {
        await writeFile(`${gConfig.debugRoot}/parsed-${arrName}.txt`, arr.join("\n"));
    }
}
export class ParserWorker {
    id!: number;
    wk!: Worker;
    online!: boolean;
    onlineCb!: (id: number, status: boolean) => void;
    completedCb!: (id: number, status: boolean) => void;
    progress!: Progress;
    isBusy = false;

    // for data
    unknownSect1Class!: string[];
    unknownSect2Class!: string[];
    unknownSect3Class!: string[];
    unknownSect4Class!: string[];
    unknownOBClass!: string[];
    unknownLBClass!: string[];
    parseDetails!: ParsedDetails;

    reportedKnownData!: ReportedKnownData;
    // for data

    static async create(gObj: GlobalObj, gConfig: GlobalConfig, workerFile: URL): Promise<ParserWorker[]> {
        const retArr = new Array(gConfig.noOfParsers);
        const onlineBarrier = createBarrier(gConfig.noOfParsers);
        for (let counter = 0; counter < gConfig.noOfParsers; counter++) {
            const wkObj = new ParserWorker();
            wkObj.id = counter;
            wkObj.progress = gObj.progress;
            wkObj.onlineCb = onlineBarrier.cb;
            const wkData: WKData = { id: counter, gConfig };
            const worker = new Worker(workerFile, { workerData: wkData });
            worker.on("online", wkObj.onOnline.bind(wkObj));
            worker.on("error", wkObj.onError.bind(wkObj));
            worker.on("message", wkObj.onMessage.bind(wkObj));
            worker.on("exit", wkObj.onExit.bind(wkObj));
            wkObj.wk = worker;
            retArr[counter] = wkObj;
        }
        await onlineBarrier.promise;
        return retArr;
    }
    static async parse(gObj: GlobalObj, gConfig: GlobalConfig, parser: ParserWorker[], srcFile: string): Promise<ReportedKnownData> {
        const data = await readFile(srcFile, "utf-8");
        const progress = gObj.progress;
        const completedBarrier = createBarrier(parser.length);
        const sect1 = data.split("<div class=\"sect1\">");
        // remove unnessary data.
        sect1.shift();
        let offset = 0;
        const jobPerParser = Math.ceil(sect1.length / parser.length);
        progress.print("blue", `No of Sect1 = ${sect1.length}`);
        for (let wkCounter = 0; wkCounter < parser.length; wkCounter++) {
            const worker = parser[wkCounter];
            worker.completedCb = completedBarrier.cb;
            const job: MsgMWJob = { type: "job", data: sect1.slice(offset, offset + jobPerParser > sect1.length ? sect1.length : offset + jobPerParser) };
            worker.sendJob(job);
            offset += jobPerParser;
        }
        await completedBarrier.promise;
        if (gConfig.isDebug) {
            debugUnknownClass(gConfig, parser, 1);
            debugUnknownClass(gConfig, parser, 2);
            debugUnknownClass(gConfig, parser, 3);
            debugUnknownClass(gConfig, parser, 4);
            debugOBUnknownClass(gConfig, parser);
            debugLBUnknownClass(gConfig, parser);
            debugParsedDetails(gConfig, parser);
        }
        const parsedData: ReportedKnownData = {
            Struct: {},
            Union: {},
            Enum: {},
            Alias: {},
            FuncPointer: {},
            Handle: {},
            Macro: {},
            MacroFunc: {},
            Command: {}
        };
        const keyArr=Object.keys(parser[0].reportedKnownData) as unknown as keyof ReportedKnownData;
        for (let counter=0;counter<keyArr.length;counter++) {
            const typeName=keyArr[counter] as keyof ReportedKnownData;
            for (const ps of parser) {
                parsedData[typeName]={...parsedData[typeName],...ps.reportedKnownData[typeName]}
            }
        }
        return parsedData;
    }
    sendJob(msg: MsgMW) {
        if (this.isBusy) return false;
        this.isBusy = true;
        this.wk.postMessage(msg);
        return true;
    }
    onOnline() {
        this.online = true;
        this.onlineCb(this.id, true);
        this.progress.setStatus(this.id, "online");
    }
    onError(error: unknown) {
        this.online = false;
        console.log(error);
        this.onlineCb(this.id, false);
        this.completedCb(this.id, false);
        this.progress.setStatus(this.id, "exit");
    }
    onMessage(msg: MsgWM) {
        switch (msg.type) {
            case "parsed": {
                this.progress.setParserStatus(this.id, msg);
                break;
            }
            case "completed": {
                this.progress.setStatus(this.id, "online");
                this.isBusy = false;
                this.progress.setParserStatus(this.id, msg.parsed);
                this.unknownSect1Class = msg.unknownSect1Class;
                this.unknownSect2Class = msg.unknownSect2Class;
                this.unknownSect3Class = msg.unknownSect3Class;
                this.unknownSect4Class = msg.unknownSect4Class;
                this.unknownOBClass = msg.unknownOBClass;
                this.unknownLBClass = msg.unknownLBClass;
                this.parseDetails = msg.parsed.parsedDetails;
                this.reportedKnownData = msg.reportedKnownData;
                this.completedCb(this.id, true);
                break;
            }
            case "working": {
                this.progress.setStatus(this.id, "working");
                break;
            }
        }
    }
    onExit() {
        this.online = false;
        this.progress.setStatus(this.id, "exit");
    }
}