import type { Openblock, HtmlTag } from "./parser-html";
import type { WKConfig } from "./parser-worker";

export type TagExplanation = { type: string, start: number, end: number ,sectionIndex:number,tagStart:number,tagEnd:number};
export type TagExplanationCol = { [key: string]: {upTag:string[],list:TagExplanation[]} };
export type SectLv = { tag: string[], parent?: SectLv, nameStart: number, nameEnd: number };
export type SourceData = { openblock: Openblock[], source: string, sourceTags: HtmlTag[], sectionIndex: number };
export const report = (wkConfig: WKConfig, num?: number) => {
    if(num && num>0){
        wkConfig.status.parsed+=num;
    }else{
        wkConfig.status.parsed++;
    }
    wkConfig.parent.postMessage(wkConfig.status);
}
export const hasClass = (tag: HtmlTag, search: string): boolean => {
    if (tag.attr.class && tag.attr.class.indexOf(search) > -1) {
        return true;
    }
    return false;
}
export const parseOpenblock = async ({ openblock, sourceTags ,sectionIndex}: SourceData, currentLv: SectLv, htmlCounter: number) => {
    let currentTag = sourceTags[htmlCounter];
    const level=currentTag.level;
    const currentOB: Openblock = { tag: [...currentLv.tag], start: currentTag.end, end: 0 ,tagStart:htmlCounter,tagEnd:0,sectIndex:sectionIndex};
    htmlCounter++; // skip div class openblock
    while ((currentTag = sourceTags[htmlCounter]).level > level) {
        htmlCounter++;
    }
    currentOB.tagEnd=htmlCounter;
    currentOB.end = currentTag.start;
    openblock.push(currentOB);
    return htmlCounter;
}
export const parseExplanation = async ({ sourceTags,sectionIndex }: SourceData, sect1Expalanation: TagExplanation[], htmlCounter: number,className:string) => {
    let currentTag = sourceTags[htmlCounter];
    const level=currentTag.level;
    const currentTE: TagExplanation = { type: className, start: currentTag.end, end: 0,tagStart:htmlCounter,tagEnd:0,sectionIndex };
    htmlCounter++; // skip div class openblock
    while ((currentTag = sourceTags[htmlCounter]).level > level) {
        htmlCounter++;
    }
    currentTE.tagEnd=htmlCounter;
    currentTE.end = currentTag.start;
    sect1Expalanation.push(currentTE);
    return htmlCounter;
}
export const debugUnknownClassinTag=async (wkConfig:WKConfig,{sourceTags}:SourceData,sectLevel:1|2|3|4,htmlCounter:number,unknownClass:string[])=>{
    if (wkConfig.gConfig.isDebug) {
        // debug unknow sect1 class
        // debugMsg += `unknownSect1Class:found\n${JSON.stringify(currentTag.attr)}\n`;
        const currentTag=sourceTags[htmlCounter];
        if (currentTag.attr.class) {
            currentTag.attr.class.forEach(name => {
                if (wkConfig[`unknownSect${sectLevel}Class`].indexOf(name) === -1) {
                    wkConfig[`unknownSect${sectLevel}Class`].push(name);
                }
                if (unknownClass.indexOf(name) === -1) {
                    unknownClass.push(name);
                }
            })
        }
    }
}
export const debugEachUnknownOpenblockClass=(currentTag:HtmlTag,unknownOpenblockClass:string[])=>{
    if (currentTag.attr.class && currentTag.attr.class.length > 0) {
        currentTag.attr.class.forEach((className:string)=>{
            if(className && unknownOpenblockClass.indexOf(className)===-1){
                unknownOpenblockClass.push(className);
            }
        })
    }
}

export const parseListingBlock=async ()=>{
    
}