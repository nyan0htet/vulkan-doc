import { writeFile } from "fs/promises";
import type { HtmlTag, Openblock } from "./parser-html";
import { debugEachUnknownOpenblockClass, hasClass } from "./parser-sect";
import type { WKConfig } from "./parser-worker";
import type { LAlias, LBAlias, LBCommand, LBCommandProperties, LBEnum, LBFuncPointer, LBHandle, LBMacro, LBMacroFunc, LBStruct, LBUnion, LCommand, LCommandParam, LDataType, LEnum, LEnumMember, LFuncPointer, LFuncPointerParam, LHandle, ListingBlock, LMacro, LMacroFunc, LMacroFuncParam, LStruct, LStrutMember, LUnion, LUnionMember, OBDataBlock, OBGrouping } from "./openblock-types";
import { analyzeLB, analyzeNote, analyzeParagraph, analyzeSidebarBlock, analyzeUList, debugEachLBUnknownClass, debugEachParsedOpenblock, debugParsedOB, debugUnParsedLB } from "./worker-lib";
export type ClassifyOpenblock = { openblock: Openblock[], sectTags: HtmlTag[][], sectArr: string[] };
const nullMember = { related: [], plainTxt: "", pre: [] };
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
export const linkStruct = async (currentLB: ListingBlock): Promise<LStruct> => {
    const main = currentLB.main as LBStruct;
    const lStruct: LStruct = {
        type: main.type,
        name: main.name,
        same: [],
        comment: main.comment,
        validUsage: currentLB.validUsage,
        extra: {
            hostSync: currentLB.hostSync,
            hostAccess: currentLB.hostAccess,
            commandProperties: currentLB.commandProperties,
            notes: currentLB.notes,
            paragraph: currentLB.paragraph
        },
        member: {}
    }
    for (const memberName in main.member) {
        const mainMember = main.member[memberName];
        const lbMember = currentLB.members[memberName] || nullMember;
        const member: LStrutMember = { name: mainMember.name, comment: [], pre: mainMember.pre, related: lbMember.related, plainTxt: lbMember.plain };
        lStruct.member[member.name] = member;
    }
    return lStruct;
}
export const linkUnion = async (currentLB: ListingBlock): Promise<LUnion> => {
    const main = currentLB.main as LBUnion;
    const lUnion: LUnion = {
        type: main.type,
        name: main.name,
        same: [],
        comment: main.comment,
        validUsage: currentLB.validUsage,
        extra: {
            hostSync: currentLB.hostSync,
            hostAccess: currentLB.hostAccess,
            commandProperties: currentLB.commandProperties,
            notes: currentLB.notes,
            paragraph: currentLB.paragraph
        },
        member: {}
    }
    for (const memberName in main.member) {
        const mainMember = main.member[memberName];
        const lbMember = currentLB.members[memberName] || nullMember;
        const member: LUnionMember = { name: mainMember.name, comment: [], pre: mainMember.pre, related: lbMember.related, plainTxt: lbMember.plain };
        lUnion.member[member.name] = member;
    }
    return lUnion;
}
export const linkEnum = async (currentLB: ListingBlock): Promise<LEnum> => {
    const main = currentLB.main as LBEnum;
    const lEnum: LEnum = {
        type: main.type,
        name: main.name,
        same: [],
        comment: main.comment,
        extra: {
            hostSync: currentLB.hostSync,
            hostAccess: currentLB.hostAccess,
            commandProperties: currentLB.commandProperties,
            notes: currentLB.notes,
            paragraph: currentLB.paragraph
        },
        member: {}
    }
    for (const memberName in main.member) {
        const mainMember = main.member[memberName];
        const lbMember = currentLB.members[memberName] || nullMember;
        const member: LEnumMember = { name: mainMember.name, comment: mainMember.comment, related: lbMember.related, plainTxt: lbMember.plain, type: mainMember.type, alias: mainMember.alias, condition: mainMember.condition, value: mainMember.value };
        lEnum.member[member.name] = member;
    }
    return lEnum;
}
export const linkMacro = async (currentLB: ListingBlock): Promise<LMacro> => {
    const main = currentLB.main as LBMacro;
    const lMacro: LMacro = {
        type: main.type,
        name: main.name,
        same: [],
        comment: main.comment,
        extra: {
            hostSync: currentLB.hostSync,
            hostAccess: currentLB.hostAccess,
            commandProperties: currentLB.commandProperties,
            notes: currentLB.notes,
            paragraph: currentLB.paragraph
        }, value: main.value
    }
    return lMacro;
}
export const linkMacroFunc = async (currentLB: ListingBlock): Promise<LMacroFunc> => {
    const main = currentLB.main as LBMacroFunc;
    const lMacroFunc: LMacroFunc = {
        type: main.type,
        name: main.name,
        same: [],
        comment: main.comment,
        extra: {
            hostSync: currentLB.hostSync,
            hostAccess: currentLB.hostAccess,
            commandProperties: currentLB.commandProperties,
            notes: currentLB.notes,
            paragraph: currentLB.paragraph
        },
        body: main.body,
        params: []
    }
    for (const memberName of main.params) {
        const lbMember = currentLB.members[memberName] || nullMember;
        const member: LMacroFuncParam = { name: memberName, comment: [], related: lbMember.related, plainTxt: lbMember.plain };
        lMacroFunc.params.push(member);
    }
    return lMacroFunc;
}
export const linkHandle = async (currentLB: ListingBlock): Promise<LHandle> => {
    const main = currentLB.main as LBHandle;
    const lHandle: LHandle = {
        type: main.type,
        name: main.name,
        same: [],
        comment: main.comment,
        extra: {
            hostSync: currentLB.hostSync,
            hostAccess: currentLB.hostAccess,
            commandProperties: currentLB.commandProperties,
            notes: currentLB.notes,
            paragraph: currentLB.paragraph
        },
        caller: main.caller
    }
    return lHandle;
}
export const linkFuncPointer = async (currentLB: ListingBlock): Promise<LFuncPointer> => {
    const main = currentLB.main as LBFuncPointer;
    const lFuncPointer: LFuncPointer = {
        type: main.type,
        name: main.name,
        same: [],
        comment: main.comment,
        extra: {
            hostSync: currentLB.hostSync,
            hostAccess: currentLB.hostAccess,
            commandProperties: currentLB.commandProperties,
            notes: currentLB.notes,
            paragraph: currentLB.paragraph
        },
        params: [],
        macro: main.macro,
        returns: main.returns
    };
    for (const memberName of main.params) {
        const lbMember = currentLB.members[memberName] || nullMember;
        const mainMember = main.paramDetails[memberName];
        const member: LFuncPointerParam = { name: memberName, related: lbMember.related, plainTxt: lbMember.plain, pre: mainMember.pre };
        lFuncPointer.params.push(member);
    }
    return lFuncPointer;
}
export const linkCommand = async (currentLB: ListingBlock): Promise<LCommand> => {
    const main = currentLB.main as LBCommand;
    const lCommand: LCommand = {
        type: main.type,
        name: main.name,
        same: [],
        comment: main.comment,
        extra: {
            hostSync: currentLB.hostSync,
            hostAccess: currentLB.hostAccess,
            commandProperties: currentLB.commandProperties,
            notes: currentLB.notes,
            paragraph: currentLB.paragraph
        },
        params: [],
        returns: main.returns
    };
    for (const memberName of main.params) {
        const lbMember = currentLB.members[memberName] || nullMember;
        const mainMember = main.paramDetails[memberName];
        const member: LCommandParam = { name: memberName, related: lbMember.related, plainTxt: lbMember.plain, pre: mainMember.pre };
        lCommand.params.push(member);
    }
    return lCommand;
}
export const linkAlias = async (currentLB: ListingBlock): Promise<LAlias> => {
    const main = currentLB.main as LBAlias;
    const lAlias: LAlias = {
        ...main,
        extra: {
            hostSync: currentLB.hostSync,
            hostAccess: currentLB.hostAccess,
            commandProperties: currentLB.commandProperties,
            notes: currentLB.notes,
            paragraph: currentLB.paragraph
        },
        same: []
    }
    return lAlias;
}
export const classifyOpenblock = async (wkConfig: WKConfig, { openblock, sectTags, sectArr }: ClassifyOpenblock) => {
    for (let obCounter = 0; obCounter < openblock.length; obCounter++) {
        const currentOB = openblock[obCounter];
        const currentSection = sectTags[currentOB.sectIndex];
        let tagMaxLevel = currentSection[currentOB.tagStart + 1].level;
        let tagCounter = currentOB.tagStart + 2;
        let currentTag = currentSection[tagCounter];
        let currentGroup: OBGrouping = { listingBlock: undefined, same: [], pre: [], post: [], isSkipped: false, parsed: undefined as unknown as LDataType };
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
                        currentGroup = { listingBlock: undefined, same: [], pre: [], post: [], isSkipped: false, parsed: undefined as unknown as LDataType };
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
                        currentGroup = { listingBlock: undefined, same: currentGroup.same, pre: currentGroup.pre, post: currentGroup.post, isSkipped: false, parsed: undefined as unknown as LDataType };
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
            if (nowGroup.listingBlock) {
                const currentLB: ListingBlock = { main: undefined as unknown as ListingBlock["main"], same: [], members: {}, validUsage: {}, returnFiltered: {}, hostSync: [], hostAccess: [], commandProperties: { exist: false } as LBCommandProperties, paragraph: { plain: "", related: [] }, notes: { plain: "", related: [] } };
                // parse listingblock
                if (!await analyzeLB(wkConfig, currentLB, nowGroup, sectTags, sectArr)) {
                    nowGroup.isSkipped = true;
                    await debugUnParsedLB(wkConfig, nowGroup, obCounter, sectArr);
                    continue groupFor;
                }
                if (nowGroup.pre.length > 0) {
                    for (let preCounter = 0; preCounter < nowGroup.pre.length; preCounter++) {
                        const currentPre = nowGroup.pre[preCounter];
                        // ulist isnot need.
                        if (currentPre.type === "paragraph") {
                            await analyzeParagraph(currentLB, currentPre, sectTags, sectArr);
                        } else if (currentPre.type === "admonitionblock") {
                            await analyzeNote(currentLB, currentPre, sectTags, sectArr);
                        }
                    }
                }
                if (nowGroup.post.length > 0) {
                    for (let postCounter = 0; postCounter < nowGroup.post.length; postCounter++) {
                        const currentPost = nowGroup.post[postCounter];
                        if (currentPost.type === "ulist") {
                            // parse parameters
                            await analyzeUList(currentLB, currentPost, sectArr);
                        } else if (currentPost.type === "sidebarblock") {
                            await analyzeSidebarBlock(currentLB, currentPost, sectTags, sectArr);
                        } else if (currentPost.type === "olist") {
                            // reverse for future. current is not necessary.
                        } else if (currentPost.type === "stemblock") {
                            // reverse for future. current is not necessary.
                        } else if (currentPost.type === "paragraph") {
                            await analyzeParagraph(currentLB, currentPost, sectTags, sectArr);
                        } else if (currentPost.type === "admonitionblock") {
                            await analyzeNote(currentLB, currentPost, sectTags, sectArr);
                        }
                    }
                }
                // link
                linkSh: switch (currentLB.main.type) {
                    case "Struct": {
                        nowGroup.parsed = await linkStruct(currentLB);
                        break linkSh;
                    }
                    case "Union": {
                        nowGroup.parsed = await linkUnion(currentLB);
                        break linkSh;
                    }
                    case "Enum": {
                        nowGroup.parsed = await linkEnum(currentLB);
                        break linkSh;
                    }
                    case "Macro": {
                        nowGroup.parsed = await linkMacro(currentLB);
                        break linkSh;
                    }
                    case "MacroFunc": {
                        nowGroup.parsed = await linkMacroFunc(currentLB);
                        break linkSh;
                    }
                    case "Handle": {
                        nowGroup.parsed = await linkHandle(currentLB);
                        break linkSh;
                    }
                    case "FuncPointer": {
                        nowGroup.parsed = await linkFuncPointer(currentLB);
                        break linkSh;
                    }
                    case "Command": {
                        nowGroup.parsed = await linkCommand(currentLB);
                        break linkSh;
                    }
                    case "Alias": {
                        nowGroup.parsed = await linkAlias(currentLB);
                        break linkSh;
                    }
                }
                await debugParsedOB(wkConfig, currentLB, obCounter, groupCounter);
            } else {
                nowGroup.isSkipped = true;
            }
        }
        for (let groupCounter = 0; groupCounter < obGroups.length; groupCounter++) {
            const nowGroup = obGroups[groupCounter];
            if (!nowGroup.isSkipped) {
                const parsed = nowGroup.parsed;
                // if(parsedLB && parsedLB.main){
                wkConfig.reportedKnownData[parsed.type][parsed.name] = parsed;
                if (nowGroup.same.length > 0) {
                    for (let sameCounter = 0; sameCounter < nowGroup.same.length; sameCounter++) {
                        const sameGroup = nowGroup.same[sameCounter];
                        if (!sameGroup.isSkipped && sameGroup.parsed.name !== parsed.name) {
                            // if(sameGroup.parsedLB && sameGroup.parsedLB.main){
                            parsed.same.push([sameGroup.parsed.type, sameGroup.parsed.name]);
                            // }
                        }
                    }
                }
                // }
            }
        }
        reportOBParsed(wkConfig);
        //link
    }
}

