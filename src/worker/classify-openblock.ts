import { writeFile } from "fs/promises";
import type { HtmlTag, Openblock } from "./parser-html";
import { debugEachUnknownOpenblockClass, hasClass } from "./parser-sect";
import type { WKConfig } from "./parser-worker";
import type { LBCommandProperties, ListingBlock, OBDataBlock, OBGrouping } from "./openblock-types";
import { analyzeLB, analyzeNote, analyzeParagraph, analyzeSidebarBlock, analyzeUList, debugEachLBUnknownClass, debugEachParsedOpenblock, debugParsedOB, debugUnParsedLB } from "./worker-lib";
export type ClassifyOpenblock = { openblock: Openblock[], sectTags: HtmlTag[][], sectArr: string[] };

const reportOBParsed = (wkConfig: WKConfig, num?: number) => {
    if (num) {
        if (num > 0) {
            wkConfig.status.obParsed += num;
            wkConfig.parent.postMessage(wkConfig.status);
        }
    } else {
        wkConfig.status.obParsed++;
        wkConfig.parent.postMessage(wkConfig.status);
    }
}
export const classifyOpenblock = async (wkConfig: WKConfig, { openblock, sectTags, sectArr }: ClassifyOpenblock) => {
    for (let obCounter = 0; obCounter < openblock.length; obCounter++) {
        const currentOB = openblock[obCounter];
        const currentSection = sectTags[currentOB.sectIndex];
        let tagMaxLevel = currentSection[currentOB.tagStart + 1].level;
        let tagCounter = currentOB.tagStart + 2;
        let currentTag = currentSection[tagCounter];
        let currentGroup: OBGrouping = { listingBlock: undefined, same: [], pre: [], post: [], isParsed: false, isSkipped: false, parsedLB: undefined as unknown as ListingBlock };
        currentGroup.same.push(currentGroup); // same element in same.
        let obGroups: OBGrouping[] = [currentGroup];
        let isFounded = false;
        let isPre = true;
        // group openblock to specify group.
        while (currentTag && currentTag.level > tagMaxLevel) {
            if (currentTag.level === tagMaxLevel + 1) {
                let currentClass = "";
                if (hasClass(currentTag, "listingblock")) {
                    if (isFounded) {
                        currentGroup = { listingBlock: undefined, same: [], pre: [], post: [], isParsed: false, isSkipped: false, parsedLB: undefined as unknown as ListingBlock };
                        currentGroup.same.push(currentGroup); // same element of this.
                        obGroups.push(currentGroup);
                    }
                    isPre = false;
                    isFounded = true;
                    // if(currentOB.sectIndex===undefined){
                    //     console.log(JSON.stringify(currentOB),new Array(13).join("\n"));
                    // }
                    currentGroup.listingBlock = { sectIndex: currentOB.sectIndex, tag: currentOB.tag, tagStart: tagCounter, tagEnd: 0, type: "listingblock", start: currentTag.end, end: 0 };
                    const subLevel = currentTag.level;
                    while ((currentTag = currentSection[++tagCounter]).level > subLevel) { } // skip to end of block
                    currentGroup.listingBlock.tagEnd = tagCounter;
                    currentGroup.listingBlock.end = currentTag.start;
                } else if (hasClass(currentTag, (currentClass = "ulist")) || hasClass(currentTag, (currentClass = "sidebarblock")) || hasClass(currentTag, (currentClass = "olist")) || hasClass(currentTag, (currentClass = "stemblock")) || hasClass(currentTag, (currentClass = "dlist")) || hasClass(currentTag, (currentClass = "admonitionblock")) || hasClass(currentTag, (currentClass = "tableblock"))) {
                    // dlist = return code list.
                    // sidebarlock= host sync, host accss, command properties, valid usage
                    // admonitionblock = note.
                    // tableblock = host syncs note.
                    // stemblock = math equation.
                    const otherBlock: OBDataBlock = { type: currentClass, sectIndex: currentOB.sectIndex, tag: currentOB.tag, tagStart: tagCounter, tagEnd: 0, start: currentTag.end, end: 0 };
                    const subLevel = currentTag.level;
                    while ((currentTag = currentSection[++tagCounter]).level > subLevel) { } // skip to end of block
                    otherBlock.tagEnd = tagCounter;
                    otherBlock.end = currentTag.start;
                    currentGroup[isPre ? "pre" : "post"].push(otherBlock);
                } else if (hasClass(currentTag, "paragraph")) {
                    const otherBlock: OBDataBlock = { type: "paragraph", sectIndex: currentOB.sectIndex, tag: currentOB.tag, tagStart: tagCounter, tagEnd: 0, start: currentTag.end, end: 0 };
                    const subLevel = currentTag.level;
                    const contentStart = currentTag.end;
                    while ((currentTag = currentSection[++tagCounter]).level > subLevel) { } // skip to end of block
                    otherBlock.tagEnd = tagCounter;
                    otherBlock.end = currentTag.start;
                    const content = sectArr[currentOB.sectIndex].substring(contentStart, currentTag.start);
                    if (content.search("or the equivalent") > -1) {
                        // or the equivalent
                        currentGroup = { listingBlock: undefined, same: currentGroup.same, pre: currentGroup.pre, post: currentGroup.post, isParsed: false, isSkipped: false, parsedLB: undefined as unknown as ListingBlock };
                        currentGroup.same.push(currentGroup);
                        obGroups.push(currentGroup);
                        isFounded = false;
                        isPre = false;
                    } else { // explanation
                        currentGroup[isPre ? "pre" : "post"].push(otherBlock);
                    }
                } else { // debug class
                    debugEachUnknownOpenblockClass(currentTag, wkConfig.unknownOpenblockClass);
                }
            }
            currentTag = currentSection[++tagCounter];
        }
        if (wkConfig.gConfig.isDebug) {
            await debugEachParsedOpenblock(wkConfig, sectArr, obCounter, obGroups);
        }
        // analyze 
        groupFor: for (let groupCounter = 0; groupCounter < obGroups.length; groupCounter++) {
            const nowGroup = obGroups[groupCounter];
            if (!nowGroup.isParsed && nowGroup.listingBlock) {
                const currentLB: ListingBlock = { main: undefined as unknown as ListingBlock["main"], same: [], members: {},validUsage:{},returnFiltered:{},hostSync:[],hostAccess:[],commandProperties:{exist:false} as LBCommandProperties,paragraph:{plain:"",related:[]} ,notes:{plain:"",related:[]}};
                // parse listingblock
                if (!await analyzeLB(wkConfig, currentLB, nowGroup, sectTags, sectArr)) {
                    nowGroup.isParsed = true;
                    nowGroup.isSkipped = true;
                    await debugUnParsedLB(wkConfig, nowGroup, obCounter, sectArr);
                    continue groupFor;
                }
                if (nowGroup.pre.length > 0) {
                    for (let preCounter = 0; preCounter < nowGroup.pre.length; preCounter++) {
                        const currentPre = nowGroup.pre[preCounter];
                        // ulist isnot need.
                        if(currentPre.type==="paragraph"){
                            await analyzeParagraph(currentLB,currentPre,sectTags,sectArr);
                        }else if(currentPre.type==="admonitionblock"){
                            await analyzeNote(currentLB,currentPre,sectTags,sectArr);
                        }
                    }
                }
                if (nowGroup.post.length > 0) {
                    for (let postCounter = 0; postCounter < nowGroup.post.length; postCounter++) {
                        const currentPost = nowGroup.post[postCounter];
                        if(currentPost.type==="ulist"){
                            // parse parameters
                            await analyzeUList(currentLB,currentPost,sectArr);
                        }else if(currentPost.type==="sidebarblock"){
                            await analyzeSidebarBlock(currentLB,currentPost,sectTags,sectArr);
                        }else if(currentPost.type==="olist"){
                            // reverse for future. current is not necessary.
                        }else if(currentPost.type==="stemblock"){
                            // reverse for future. current is not necessary.
                        }else if(currentPost.type==="paragraph"){
                            await analyzeParagraph(currentLB,currentPost,sectTags,sectArr);
                        }else if(currentPost.type==="admonitionblock"){
                            await analyzeNote(currentLB,currentPost,sectTags,sectArr);
                        }
                    }
                }
                nowGroup.isParsed = true;
                // if(nowGroup.same.length>0){
                //     for(let sameCounter=0;sameCounter<nowGroup.same.length;sameCounter++){
                //         const sameGroup=nowGroup.same[sameCounter];

                //     }
                // }
                // console.log(wkConfig.id,obCounter,groupCounter);
                await debugParsedOB(wkConfig, currentLB, obCounter, groupCounter);
            }
        }
        reportOBParsed(wkConfig);
        //link
    }
}

