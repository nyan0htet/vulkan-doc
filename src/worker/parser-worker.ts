import { MessagePort, parentPort, workerData } from "worker_threads";
import type { MsgMW, MsgWMCompleted, MsgWMParsed, WKData } from "../lib/parser";
import type { DocData } from "../type";
import { classifyTag, parseTag, type HtmlTag, type Openblock } from "./parser-html";
import { mkdir, writeFile } from "fs/promises";
import { parseSect1 } from "./parser-sect1";
import type { TagExplanation, TagExplanationCol } from "./parser-sect";
import { classifyOpenblock } from "./classify-openblock";
import { debugExplanation, debugOpenBlock, debugUnknownClass } from "./worker-lib";
const parent = parentPort as MessagePort;
const wkData: WKData = workerData;
export type WKConfig = { doc: DocData, status: MsgWMParsed, parent: MessagePort, reportFreq: number } & WKData & {
    wkDebugDir: string,
    wkDebugSect1Dir: string,
    wkDebugOpenblockDir: string,
    wkDebugParsedOpenblockDir: string,
    unknownSect1Class: string[],
    unknownSect2Class: string[],
    unknownSect3Class: string[],
    unknownSect4Class: string[],
    unknownOpenblockClass:string[],
    unknownListingblockClass:string[],
} &
{
    tagExpalantion: TagExplanationCol
}
    ;
const wkConfig: WKConfig = {
    doc: { struct: {} },
    status: { type: "parsed", total: 0, parsed: 0, ob: 0, obParsed: 0, parsedDetails: { struct: [],union:[],enum:[],alias:[],funcPointer:[],handle:[],macro:[],macroFunc:[],command:[] } },
    parent,
    reportFreq: 10,
    ...wkData,
    wkDebugDir: `${wkData.gConfig.debugRoot}/${wkData.id}`,
    wkDebugSect1Dir: "",
    wkDebugOpenblockDir: "",
    wkDebugParsedOpenblockDir: "",
    unknownSect1Class: [],
    unknownSect2Class: [],
    unknownSect3Class: [],
    unknownSect4Class: [],
    unknownOpenblockClass:[],
    unknownListingblockClass:[],
    tagExpalantion: {},
};
wkConfig.wkDebugSect1Dir = `${wkConfig.wkDebugDir}/sect1`;
wkConfig.wkDebugOpenblockDir = `${wkConfig.wkDebugDir}/openblock`;
wkConfig.wkDebugParsedOpenblockDir = `${wkConfig.wkDebugDir}/openblock-parsed`;


parent.on("message", async (msg: MsgMW) => {
    switch (msg.type) {
        case "job": {
            parent.postMessage({ type: "working" });
            const sect1 = msg.data;
            const sect1Tags: HtmlTag[][] = new Array(sect1.length);
            if (wkData.gConfig.isDebug) {
                await mkdir(wkConfig.wkDebugSect1Dir, { recursive: true });
                await mkdir(wkConfig.wkDebugOpenblockDir, { recursive: true });
                await mkdir(wkConfig.wkDebugParsedOpenblockDir, { recursive: true });
            }
            // parsing text properties.
            for (let sect1Counter = 0; sect1Counter < sect1.length; sect1Counter++) {
                sect1[sect1Counter]=sect1[sect1Counter].replaceAll(/<svg[\s\S\n]*?svg>/g,(match:string)=>{return `<img class="imageElement" src="data:image/svg+xml;base64,${Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>${match}`).toString("base64")}"/>`});
                const parsedTags = await parseTag(wkConfig, sect1[sect1Counter], sect1Counter);
                sect1Tags[sect1Counter] = parsedTags;
            }
            // parsing structure.
            const openblock: Openblock[] = [];
            for (let sectionIndex = 0; sectionIndex < sect1.length; sectionIndex++) {
                await parseSect1(wkConfig, { openblock, source: sect1[sectionIndex], sourceTags: sect1Tags[sectionIndex], sectionIndex });
            }
            // parsing openblock.
            await classifyOpenblock(wkConfig, { openblock, sectTags: sect1Tags,sectArr:sect1 });
            if (wkData.gConfig.isDebug) {
                await debugUnknownClass(wkConfig);
                await debugOpenBlock(wkConfig,openblock,sect1Tags);
                await debugExplanation(wkConfig);
            }
            const completedMsg: MsgWMCompleted = { type: "completed",parsed:wkConfig.status, unknownSect1Class: wkConfig.unknownSect1Class, unknownSect2Class: wkConfig.unknownSect2Class, unknownSect3Class: wkConfig.unknownSect3Class, unknownSect4Class: wkConfig.unknownSect4Class,unknownOBClass:wkConfig.unknownOpenblockClass,unknownLBClass:wkConfig.unknownListingblockClass };
            parent.postMessage(completedMsg);
            break;
        }
    }
});