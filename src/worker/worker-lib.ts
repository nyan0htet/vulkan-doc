import { mkdir, writeFile } from "fs/promises";
import type { HtmlTag, Openblock } from "./parser-html";
import type { WKConfig } from "./parser-worker";
import type { LBAlias, LBCommand, LBEnum, LBEnumMember, LBExplanation, LBFPParam, LBFuncPointer, LBHandle, LBHostSync, LBMacro, LBMacroFunc, LBReturnFiltered, LBStruct, LBStructMember, LBUnion, LBValidUsage, ListingBlock, OBDataBlock, OBGrouping, ReportedKnownData } from "./openblock-types";
import { hasClass } from "./parser-sect";
const htmlTagPattern = /<.*?>/g;
export const debugOpenBlock = async (wkConfig: WKConfig, openblock: Openblock[], sect1Tags: HtmlTag[][]) => {
    if (openblock.length > 0) {
        let bufferText = "";
        openblock.forEach(curOB => {
            bufferText += `${JSON.stringify(curOB)}\n`;
            const opTags = sect1Tags[curOB.sectIndex].slice(curOB.tagStart, curOB.tagEnd);
            let ptag: number;
            let tagOffset = "\t";
            opTags.forEach(tag => {
                if (ptag) {
                    if (ptag > tag.level) {
                        tagOffset = tagOffset.substring(0, tagOffset.length - 1);
                        ptag--;
                    } else if (ptag < tag.level) {
                        tagOffset += "\t";
                        ptag++;
                    }
                } else {
                    ptag = tag.level;
                    tagOffset
                }
                bufferText += `${tagOffset}${JSON.stringify(tag)}\n`;
            });
            bufferText += `**********************************\n`;
        });
        await writeFile(`${wkConfig.wkDebugOpenblockDir}/openblock-before-parsed.txt`, bufferText);
    }
}

export const debugExplanation = async (wkConfig: WKConfig) => {
    const explanation = Object.keys(wkConfig.tagExpalantion);
    if (explanation.length > 0) {
        let bufferText = "";
        explanation.forEach(explain => {
            const currentExp = wkConfig.tagExpalantion[explain];
            bufferText += `${explain}: \n\tuptag: \n\t\t${currentExp.upTag.join("\t\t")}\n\tlist:\n`;
            currentExp.list.forEach(inlineExp => {
                bufferText += `\t\t${JSON.stringify(inlineExp)}\n`;
            });
            bufferText += "--------------------------------------------------------------------------\n";
        });
        await writeFile(`${wkConfig.wkDebugOpenblockDir}/tag-explanation.txt`, bufferText);
    }
}

export const debugUnknownClass = async (wkConfig: WKConfig) => {
    if (wkConfig.unknownSect1Class.length > 0) await writeFile(`${wkConfig.wkDebugDir}/unknownSect1Class.txt`, wkConfig.unknownSect1Class.join(","));
    if (wkConfig.unknownSect2Class.length > 0) await writeFile(`${wkConfig.wkDebugDir}/unknownSect2Class.txt`, wkConfig.unknownSect2Class.join(","));
    if (wkConfig.unknownSect3Class.length > 0) await writeFile(`${wkConfig.wkDebugDir}/unknownSect3Class.txt`, wkConfig.unknownSect3Class.join(","));
    if (wkConfig.unknownSect4Class.length > 0) await writeFile(`${wkConfig.wkDebugDir}/unknownSect4Class.txt`, wkConfig.unknownSect4Class.join(","));
    if (wkConfig.unknownOpenblockClass.length > 0) await writeFile(`${wkConfig.wkDebugDir}/unknownOpenblockClass.txt`, wkConfig.unknownOpenblockClass.join(","));
    if (wkConfig.unknownListingblockClass.length > 0) await writeFile(`${wkConfig.wkDebugDir}/unknownListingblockClass.txt`, wkConfig.unknownListingblockClass.join(","));
}

export const debugEachUnknownClass = async (wkConfig: WKConfig, sectionIndex: number, sectName: 1 | 2 | 3 | 4) => {
    const unknownSectClass = wkConfig[`unknownSect${sectName}Class`];
    if (unknownSectClass.length > 1) {
        await writeFile(`${wkConfig.wkDebugSect1Dir}/${sectionIndex}-unknownSect${sectName}Class.txt`, unknownSectClass.join(","));
    }
}

export const debugEachOpenblock = async (wkConfig: WKConfig, sectionIndex: number, source: string, openblock: Openblock[]) => {
    if (openblock.length > 1) {
        let openblockText = "";
        let openblockTagText = "";
        openblock.forEach(op => {
            openblockText += `<div class="openblock">${source.substring(op.start, op.end)}</div>\n`;
            openblockTagText += `${JSON.stringify(op)}\n`;
        });
        await writeFile(`${wkConfig.wkDebugOpenblockDir}/openblock-sect1-${sectionIndex}.html`, openblockText);
        await writeFile(`${wkConfig.wkDebugOpenblockDir}/openblock-sect1-tag-${sectionIndex}.txt`, openblockTagText);
    }
}

export const debugEachParsedOpenblock = async (wkConfig: WKConfig, sectArr: string[], opCounter: number, obGroups: OBGrouping[]) => {
    let debugText = `noOfOpenblock:${obGroups.length}\n`;
    const currentDebugDir = `${wkConfig.wkDebugParsedOpenblockDir}/${opCounter}`;
    await mkdir(currentDebugDir, { recursive: true });
    for (let groupCounter = 0; groupCounter < obGroups.length; groupCounter++) {
        const currentGroup = obGroups[groupCounter];
        const listingBlock = currentGroup.listingBlock as OBDataBlock;
        debugText += `${groupCounter + 1}:\n\tlistingblock:\n\t\t${JSON.stringify(listingBlock)}\n`;
        if (listingBlock) {
            await writeFile(`${currentDebugDir}/gp${groupCounter}-listingblock.html`, sectArr[listingBlock.sectIndex].substring(listingBlock.start, listingBlock.end))
        }
        if (currentGroup.same.length > 1) {
            debugText += `\tsame:\n`;
            for (let subGpCounter = 0; subGpCounter < currentGroup.same.length; subGpCounter++) {
                const sameGroup = currentGroup.same[subGpCounter];
                debugText += `\t\t${JSON.stringify(sameGroup.listingBlock)}\n`;
            }

        }
        if (currentGroup.pre.length) {
            debugText += `\tpre:\n`;
            for (let subGpCounter = 0; subGpCounter < currentGroup.pre.length; subGpCounter++) {
                const preExp = currentGroup.pre[subGpCounter];
                debugText += `\t\t${JSON.stringify(preExp)}\n`;
                await writeFile(`${currentDebugDir}/pre-${preExp.type}-${subGpCounter}.html`, sectArr[preExp.sectIndex].substring(preExp.start, preExp.end));
            }
        }
        if (currentGroup.post.length) {
            debugText += `\tpost:\n`;
            for (let subGpCounter = 0; subGpCounter < currentGroup.post.length; subGpCounter++) {
                const postExp = currentGroup.post[subGpCounter];
                debugText += `\t\t${JSON.stringify(postExp)}\n`;
                await writeFile(`${currentDebugDir}/post-${postExp.type}-${subGpCounter}.html`, sectArr[postExp.sectIndex].substring(postExp.start, postExp.end));
            }
        }
    }
    await writeFile(`${currentDebugDir}/${opCounter}.yaml`, debugText);
}

export const debugEachLBUnknownClass = (wkConfig: WKConfig, currentTag: HtmlTag, level: string) => {
    currentTag.attr.class.forEach(className => {
        if (wkConfig.unknownListingblockClass.indexOf(`${level}-${className}`) > -1) return;
        wkConfig.unknownListingblockClass.push(`${level}-${className}`);
    })
}
export const analyzeLBStruct = async (sectTag: HtmlTag[], sectStr: string, htmlCounter: number, preComment: string[]): Promise<LBStruct | undefined> => {
    const structV: LBStruct = { name: "", comment: preComment, member: {}, type: "Struct" };
    let currentTag = sectTag[++htmlCounter]; //start of span
    ++htmlCounter; //end of span
    if (currentTag.type === "span" && hasClass(currentTag, "nc")) {
        structV.name = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
        currentTag = sectTag[++htmlCounter]; //start of span
        ++htmlCounter; //end of span
        if (currentTag.type === "span" && hasClass(currentTag, "p") && sectStr.substring(currentTag.end, sectTag[htmlCounter].start) === "{") {
            currentTag = sectTag[++htmlCounter]; //start of span
            ++htmlCounter; //end of span
            let tempString = "";
            while (currentTag.type === "span" && currentTag.attr.class.length > 0 && (tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start)) !== "}") {
                const structMember: LBStructMember = { name: "", pre: [], comment: [] };
                while (tempString !== ";") {
                    if (hasClass(currentTag, "c1")) {
                        structMember.comment.push(tempString);
                    } else {
                        structMember.pre.push([currentTag.attr.class[0], tempString]);
                    }
                    currentTag = sectTag[++htmlCounter]; //start of span
                    ++htmlCounter; //end of span
                    tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
                }
                const structName = structMember.pre.pop()?.[1];
                if (structName) {
                    structMember.name = structName;
                    structV.member[structName] = structMember;
                } else {
                    return;
                }
                currentTag = sectTag[++htmlCounter]; //start of span
                ++htmlCounter; //end of span
                tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
            }
            return structV;
        }
    }
}
export const analyzeLBUnion = async (sectTag: HtmlTag[], sectStr: string, htmlCounter: number, preComment: string[]): Promise<LBUnion | undefined> => {
    const unionV: LBUnion = { name: "", comment: preComment, member: {}, type: "Union" };
    // console.log("union")
    let currentTag = sectTag[++htmlCounter]; //start of span
    ++htmlCounter; //end of span
    if (currentTag.type === "span" && hasClass(currentTag, "n")) {
        unionV.name = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
        currentTag = sectTag[++htmlCounter]; //start of span
        ++htmlCounter; //end of span
        if (currentTag.type === "span" && hasClass(currentTag, "p") && sectStr.substring(currentTag.end, sectTag[htmlCounter].start) === "{") {
            currentTag = sectTag[++htmlCounter]; //start of span
            ++htmlCounter; //end of span
            let tempString = "";
            while (currentTag.type === "span" && currentTag.attr.class.length > 0 && (tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start)) !== "}") {
                const unionMember: LBStructMember = { name: "", pre: [], comment: [] };
                while (tempString !== ";") {
                    if (hasClass(currentTag, "c1")) {
                        unionMember.comment.push(tempString);
                    } else {
                        unionMember.pre.push([currentTag.attr.class[0], tempString]);
                    }
                    currentTag = sectTag[++htmlCounter]; //start of span
                    ++htmlCounter; //end of span
                    tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
                }
                const unionName = unionMember.pre.pop()?.[1];
                if (unionName) {
                    unionMember.name = unionName;
                    unionV.member[unionName] = unionMember;
                } else {
                    return;
                }
                currentTag = sectTag[++htmlCounter]; //start of span
                ++htmlCounter; //end of span
                tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
            }
            return unionV;
        }
    }
}
export const analyzeLBEnum = async (sectTag: HtmlTag[], sectStr: string, htmlCounter: number, preComment: string[]): Promise<LBEnum | undefined> => {
    const enumV: LBEnum = { name: "", comment: preComment, member: {}, type: "Enum" };
    // console.log("union")
    let currentTag = sectTag[++htmlCounter]; //start of span
    ++htmlCounter; //end of span
    if (currentTag.type === "span" && hasClass(currentTag, "n")) {
        enumV.name = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
        currentTag = sectTag[++htmlCounter]; //start of span
        ++htmlCounter; //end of span
        if (currentTag.type === "span" && hasClass(currentTag, "p") && sectStr.substring(currentTag.end, sectTag[htmlCounter].start) === "{") {
            currentTag = sectTag[++htmlCounter]; //start of span
            ++htmlCounter; //end of span
            let tempString = "";
            while (currentTag.type === "span" && currentTag.attr.class.length > 0 && (tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start)) !== "}") {
                const enumMember = { name: "", comment: [], value: "", condition: "" } as unknown as LBEnumMember;
                let isNameFound = false;
                while (tempString !== ",") {
                    if (hasClass(currentTag, "c1")) {
                        enumMember.comment.push(tempString);
                    } else if (hasClass(currentTag, "cp")) {
                        const regexStr = tempString.replace("\n", "");
                        if (regexStr.includes("#ifdef")) {
                            const matchArr = regexStr.match(/[A-Z_]+/g);
                            enumMember.condition = matchArr ? matchArr[0] : "";
                        }
                    } else if (hasClass(currentTag, "o")) {
                        // = do nothing
                    } else {
                        const memberName = tempString.trim();
                        if (hasClass(currentTag, "mi")) {
                            // number
                            enumMember.type = "number";
                            enumMember.value = memberName;
                        } else if (hasClass(currentTag, "mh")) {
                            // bit flag
                            enumMember.type = "bitFlag";
                            enumMember.value = memberName;
                        } else if (hasClass(currentTag, "n")) {
                            // alias or name
                            if (!isNameFound) {
                                enumMember.name = memberName;
                                enumV.member[memberName] = enumMember;
                                isNameFound = true;
                            } else {
                                enumMember.type = "alias";
                                enumMember.alias = memberName;
                                enumMember.value = enumV.member[enumMember.alias].value;
                            }
                        } else if (hasClass(currentTag, "p") && tempString.includes("}")) {
                            // reached to end of enum.
                            return enumV;
                        } else {
                            // error
                            return;
                        }
                    }
                    currentTag = sectTag[++htmlCounter]; //start of span
                    ++htmlCounter; //end of span
                    tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
                }
                currentTag = sectTag[++htmlCounter]; //start of span
                ++htmlCounter; //end of span
                tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
            }
            return enumV;
        }
    }
}
export const analyzeLBAlias = async (sectTag: HtmlTag[], sectStr: string, htmlCounter: number, preComment: string[]): Promise<LBAlias | undefined> => {
    const aliasV: LBAlias = { name: "", comment: preComment, type: "Alias", srcType: "", aliasClass: "", isSrcPointer: false };
    // console.log("union")
    let currentTag = sectTag[htmlCounter - 1]; //start of span and end of span
    let tempString = "";
    let isSrcFound = false;
    while (!(tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start)).includes(";")) {
        if (tempString.includes("*")) {
            aliasV.isSrcPointer = true;
        } else if (isSrcFound) {
            aliasV.name = tempString.trim();
        } else {
            aliasV.srcType = tempString.trim();
            if (!currentTag.attr.class) return;
            aliasV.aliasClass = currentTag.attr.class[0];
            isSrcFound = true;
        }
        currentTag = sectTag[++htmlCounter]; //start of span
        ++htmlCounter; //end of span
    }
    return aliasV;
}
export const analyzeLBFuncPointer = async (sectTag: HtmlTag[], sectStr: string, htmlCounter: number, preComment: string[]): Promise<LBFuncPointer | undefined> => {
    const fpV: LBFuncPointer = { name: "", comment: preComment, type: "FuncPointer", returns: [], macro: "", params: [], paramDetails: {} };
    // console.log("union")
    let currentTag = sectTag[htmlCounter - 1]; //start of span and end of span
    // start parsing function returns.
    let tempString = "";
    while (!(tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start)).includes("(")) {
        if (!currentTag.attr.class) return;
        fpV.returns.push([currentTag.attr.class[0], tempString]);
        currentTag = sectTag[++htmlCounter]; //start of span
        ++htmlCounter; //end of span
    }
    currentTag = sectTag[++htmlCounter]; //start of span of macro
    ++htmlCounter; //end of span
    fpV.macro = sectStr.substring(currentTag.end, sectTag[htmlCounter].start).trim();
    currentTag = sectTag[++htmlCounter]; //start of span of macro
    ++htmlCounter; //end of span
    if (!sectStr.substring(currentTag.end, sectTag[htmlCounter].start).includes("*")) { // if not includes *, it is not pointer
        return;
    }
    currentTag = sectTag[++htmlCounter]; //start of span of function pointer name.
    ++htmlCounter; //end of span
    fpV.name = sectStr.substring(currentTag.end, sectTag[htmlCounter].start).trim();
    currentTag = sectTag[++htmlCounter]; //start of span
    ++htmlCounter; //end of span
    tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
    if (!tempString.includes(")") || !tempString.includes("(")) { // if not includes )(, it is not bracket
        return;
    }
    currentTag = sectTag[++htmlCounter]; //start of span
    ++htmlCounter; //end of span
    let fpParam: LBFPParam = { name: "", pre: [] };
    while (!(tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start)).includes(");")) {
        if (tempString.includes(",")) {
            const popedArr = fpParam.pre.pop();
            if (popedArr) {
                if (!popedArr[1].includes("void")) {
                    fpParam.name = popedArr[1];
                    fpV.params.push(fpParam.name);
                    fpV.paramDetails[fpParam.name] = fpParam;
                }
                fpParam = { name: "", pre: [] };
            } else {
                return;
            }
        } else {
            if (!currentTag.attr.class) return;
            fpParam.pre.push([currentTag.attr.class[0], tempString.trim()]);
        }
        currentTag = sectTag[++htmlCounter]; //start of span
        ++htmlCounter; //end of span
    }
    const popedArr = fpParam.pre.pop();
    if (popedArr) {
        if (!popedArr[1].includes("void")) {
            fpParam.name = popedArr[1];
            fpV.params.push(fpParam.name);
            fpV.paramDetails[fpParam.name] = fpParam;
        }
        fpParam = { name: "", pre: [] };
    } else {
        return;
    }
    return fpV;
}
export const analyzeLBMacro = async (sectTag: HtmlTag[], sectStr: string, htmlCounter: number, preComment: string[]): Promise<LBMacro | LBMacroFunc | undefined> => {
    // console.log("union")
    let currentTag = sectTag[htmlCounter - 1]; //start of span and end of span
    // start parsing function returns.
    let tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start).replace(/,[ ]{1,}/g, ",");
    if (tempString.includes("#define")) {
        const splitedArr = tempString.split(/[ ]{1,}/g);
        if (splitedArr[1].includes("(") && splitedArr[1].includes(")")) {
            // macro function
            const matchedArr = splitedArr[1].match(/[a-zA-Z_]{1,}\(.*?\)/g);
            if (matchedArr && matchedArr.length === 1) {
                const nameAndParam = matchedArr[0].slice(0, -1).split("(");
                if (nameAndParam.length !== 2) {
                    return;
                }
                const microFuncV: LBMacroFunc = { type: "MacroFunc", name: nameAndParam[0], comment: preComment, body: splitedArr.slice(2).join(" "), params: nameAndParam[1].split(",") };
                return microFuncV;
            } else {
                return;
            }
        } else {
            // macro
            const macroV: LBMacro = { name: splitedArr[1].trim(), comment: preComment, value: splitedArr[2].trim(), type: "Macro" };
            return macroV;
        }
    }
    return;
}
export const analyzeLBHandle = async (sectTag: HtmlTag[], sectStr: string, htmlCounter: number, preComment: string[]): Promise<LBHandle | undefined> => {
    // console.log("union")
    let currentTag = sectTag[htmlCounter - 1]; //start of span and end of span
    // start parsing function returns.
    const caller = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
    currentTag = sectTag[++htmlCounter]; //start of span and end of span
    ++htmlCounter;
    const leftBrace = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
    currentTag = sectTag[++htmlCounter]; //start of span and end of span
    ++htmlCounter;
    const handle = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
    currentTag = sectTag[++htmlCounter]; //start of span and end of span
    ++htmlCounter;
    const rightBrace = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
    // console.log(`${handle},${leftBrace},${caller},${rightBrace}`, new Array(23).join("\n"));
    if (leftBrace.includes("(") && rightBrace.includes(")")) {
        const handleV: LBHandle = { type: "Handle", name: handle, caller, comment: preComment };
        return handleV;
    }
    return;
}
export const analyzeLBCommand = async (sectTag: HtmlTag[], sectStr: string, htmlCounter: number, preComment: string[]): Promise<LBCommand | undefined> => {
    const commandV: LBCommand = { name: "", comment: preComment, type: "Command", returns: [], params: [], paramDetails: {} };
    let currentTag = sectTag[htmlCounter - 1]; //start of span and end of span
    // start parsing function returns.
    let tempString = "";
    while (!(tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start)).includes("(")) {
        if (!currentTag.attr.class) return;
        commandV.returns.push([currentTag.attr.class[0], tempString]);
        currentTag = sectTag[++htmlCounter]; //start of span
        ++htmlCounter; //end of span
    }
    currentTag = sectTag[++htmlCounter]; //start of span of macro
    ++htmlCounter; //end of span
    const namedArr = commandV.returns.pop();
    if (!namedArr) return;
    commandV.name = namedArr[1];
    let commandParam: LBFPParam = { name: "", pre: [] };
    while (!(tempString = sectStr.substring(currentTag.end, sectTag[htmlCounter].start)).includes(");")) {
        if (tempString.includes(",")) {
            const popedArr = commandParam.pre.pop();
            if (popedArr) {
                if (!popedArr[1].includes("void")) {
                    commandParam.name = popedArr[1];
                    commandV.params.push(commandParam.name);
                    commandV.paramDetails[commandParam.name] = commandParam;
                }
                commandParam = { name: "", pre: [] };
            } else {
                return;
            }
        } else {
            if (!currentTag.attr.class) return;
            commandParam.pre.push([currentTag.attr.class[0], tempString.trim()]);
        }
        currentTag = sectTag[++htmlCounter]; //start of span
        ++htmlCounter; //end of span
    }
    const popedArr = commandParam.pre.pop();
    if (popedArr) {
        if (!popedArr[1].includes("void")) {
            commandParam.name = popedArr[1];
            commandV.params.push(commandParam.name);
            commandV.paramDetails[commandParam.name] = commandParam;
        }
        commandParam = { name: "", pre: [] };
    } else {
        return;
    }
    return commandV;
}
export const analyzeLB = async (wkConfig: WKConfig, currentLB: ListingBlock, nowGroup: OBGrouping, sectTags: HtmlTag[][], sectArr: string[]): Promise<boolean> => {
    const listingBlock = nowGroup.listingBlock as OBDataBlock;
    const sectTag = sectTags[listingBlock.sectIndex];
    const sectStr = sectArr[listingBlock.sectIndex];
    let htmlCounter = listingBlock.tagStart + 1;
    let htmlCounterEnd = listingBlock.tagEnd - 1;
    let currentTag = sectTag[htmlCounter];
    if (currentTag.type === "div" && hasClass(currentTag, "content") && htmlCounter < htmlCounterEnd) {
        currentTag = sectTag[++htmlCounter];
        if (currentTag.type === "pre" && hasClass(currentTag, "rouge")) {
            currentTag = sectTag[++htmlCounter];
            if (currentTag.type === "code") {
                currentTag = sectTag[++htmlCounter];
                let preComment: string[] = [];
                while (hasClass(currentTag, "c1")) {
                    // has comment
                    preComment.push(sectStr.substring(currentTag.end, sectTag[++htmlCounter].start));
                    currentTag = sectTag[++htmlCounter];
                }
                // classify.
                htmlCounter++; // skip to end of span tag.
                if (hasClass(currentTag, "k") && sectStr.substring(currentTag.end, sectTag[htmlCounter].start) === "typedef") {
                    // struct or union or enum or alias or function pointer
                    currentTag = sectTag[++htmlCounter]; //start of span
                    ++htmlCounter; //end of span
                    // console.log("-------------",currentTag.attr.class.join(","));
                    if (hasClass(currentTag, "k")) {
                        const tagContent = sectStr.substring(currentTag.end, sectTag[htmlCounter].start);
                        if (tagContent === "struct") {
                            /*********************************struct ***************************/
                            const structV = await analyzeLBStruct(sectTag, sectStr, htmlCounter, preComment); // union
                            if (structV) {
                                wkConfig.status.parsedDetails.struct.push(structV.name);
                                currentLB.main = structV;
                                return true;
                            }
                            /*********************************end of struct************************************** */
                        } else if (tagContent === "union") {
                            /*********************************union********************************************** */
                            const unionV = await analyzeLBUnion(sectTag, sectStr, htmlCounter, preComment); // union
                            if (unionV) {
                                wkConfig.status.parsedDetails.union.push(unionV.name);
                                currentLB.main = unionV;
                                return true;
                            }
                            /*********************************end of union*************************************** */
                        } else if (tagContent === "enum") {
                            /*********************************enum*********************************************** */
                            const enumV = await analyzeLBEnum(sectTag, sectStr, htmlCounter, preComment); // enum
                            if (enumV) {
                                wkConfig.status.parsedDetails.enum.push(enumV.name);
                                currentLB.main = enumV;
                                return true;
                            }
                            /*********************************end of enum*********************************************** */
                        }
                    } else if (hasClass(currentTag, "n")) {
                        /*********************************alias*********************************************** */
                        const aliasV = await analyzeLBAlias(sectTag, sectStr, htmlCounter, preComment);
                        if (aliasV) {
                            wkConfig.status.parsedDetails.alias.push(aliasV.name);
                            currentLB.main = aliasV;
                            return true;
                        }
                        /*********************************end of alias*********************************************** */
                    } else if (hasClass(currentTag, "nf")) {
                        /*********************************function pointer*********************************************** */
                        const fpV = await analyzeLBFuncPointer(sectTag, sectStr, htmlCounter, preComment);
                        if (fpV) {
                            wkConfig.status.parsedDetails.funcPointer.push(fpV.name);
                            currentLB.main = fpV;
                            return true;
                        }
                        /*********************************end of function pointer*********************************************** */
                    } else if (hasClass(currentTag, "kt")) {
                        /*********************************1.function point or 2.alias*********************************************** */
                        const fpV = await analyzeLBFuncPointer(sectTag, sectStr, htmlCounter, preComment);
                        if (fpV) {
                            wkConfig.status.parsedDetails.funcPointer.push(fpV.name);
                            currentLB.main = fpV;
                            return true;
                        } else {
                            const aliasV = await analyzeLBAlias(sectTag, sectStr, htmlCounter, preComment);
                            if (aliasV) {
                                wkConfig.status.parsedDetails.alias.push(aliasV.name);
                                currentLB.main = aliasV;
                                return true;
                            }
                        }
                        /*********************************end of 1.function point or 2.alias*********************************************** */
                    } else {
                        console.log("unknown");
                        debugEachLBUnknownClass(wkConfig, currentTag, "lv2");
                    }
                } else if (hasClass(currentTag, "cp")) {
                    /*********************************macro or macrofunc***************************************************************/
                    const macroV = await analyzeLBMacro(sectTag, sectStr, htmlCounter, preComment);
                    if (macroV) {
                        if (macroV.type === "Macro") wkConfig.status.parsedDetails.macro.push(macroV.name);
                        if (macroV.type === "MacroFunc") wkConfig.status.parsedDetails.macroFunc.push(macroV.name);
                        currentLB.main = macroV;
                        return true;
                    }
                    /*********************************end of macro or macrofunc***************************************************************/
                } else if (hasClass(currentTag, "n")) {
                    /*********************************handle & command***************************************************************/
                    const handleV = await analyzeLBHandle(sectTag, sectStr, htmlCounter, preComment);
                    if (handleV) {
                        wkConfig.status.parsedDetails.handle.push(handleV.name);
                        currentLB.main = handleV;
                        return true;
                    } else {
                        // command
                        const commandV = await analyzeLBCommand(sectTag, sectStr, htmlCounter, preComment);
                        if (commandV) {
                            wkConfig.status.parsedDetails.command.push(commandV.name);
                            currentLB.main = commandV;
                            return true;
                        }
                    }
                    /*********************************end of handle & command***************************************************************/
                } else if (hasClass(currentTag, "k") || hasClass(currentTag, "kt")) {
                    /*********************************command***************************************************************/
                    const commandV = await analyzeLBCommand(sectTag, sectStr, htmlCounter, preComment);
                    if (commandV) {
                        wkConfig.status.parsedDetails.command.push(commandV.name);
                        currentLB.main = commandV;
                        return true;
                    }
                    /*********************************end of command***************************************************************/
                } else if (!currentTag.attr.class) {
                    return false;
                } else {
                    // unknown listingblockclass
                    debugEachLBUnknownClass(wkConfig, currentTag, "lv1");
                }
            }
        }
    }
    return false;
}
export const debugParsedOB = async (wkConfig: WKConfig, currentLB: ListingBlock, obCounter: number, groupCounter: number) => {
    if (wkConfig.gConfig.isDebug) {
        await writeFile(`${wkConfig.wkDebugParsedOpenblockDir}/${obCounter}/listing-${currentLB.main.type}${groupCounter}.json`, JSON.stringify(currentLB));
    }
}
export const debugUnParsedLB = async (wkConfig: WKConfig, nowGroup: OBGrouping, obCounter: number, sectArr: string[]) => {
    if (wkConfig.gConfig.isDebug && nowGroup.listingBlock) {
        await writeFile(`${wkConfig.gConfig.debugRoot}/unparsed/${nowGroup.listingBlock.sectIndex}-${obCounter}.html`, sectArr[nowGroup.listingBlock.sectIndex].substring(nowGroup.listingBlock.start, nowGroup.listingBlock.end));
    }
}

export const analyzeUList = async (currentLB: ListingBlock, currentUlist: OBDataBlock, sectArr: string[]): Promise<void> => {
    const ulistStr = sectArr[currentUlist.sectIndex].substring(currentUlist.start, currentUlist.end);
    const liRegex = RegExp(/<li>[\s\S\n]*?<\/li>/g, 'g');
    const codeRegex = RegExp(/<code>[\s\S\n]*?<\/code>/g, 'g');
    const aRegex = RegExp(/<a.*?>[\s\S\n]*?<\/a>/g, 'g');
    const linkRegex = /href="(.*?)"/g;
    const tagRegex = /\n/g;
    let liMatch: RegExpExecArray | null;
    while ((liMatch = liRegex.exec(ulistStr)) !== null) {
        const liStr = ulistStr.substring(liRegex.lastIndex - liMatch[0].length, liRegex.lastIndex);
        let isNeedToSetName = true;
        let codeMatch: RegExpExecArray | null;
        const memExp: LBExplanation = { name: "", plain: liStr.replace(tagRegex, " ").replace(htmlTagPattern, "").replaceAll("\n"," ").trim(), related: [] };
        const codeCheck: { [key: string]: boolean } = {};
        const linkCheck: { [key: string]: boolean } = {};
        while ((codeMatch = codeRegex.exec(liStr)) !== null) {
            const keyWord = liStr.substring(codeRegex.lastIndex - codeMatch[0].length, codeRegex.lastIndex).replace(htmlTagPattern, "").replaceAll("\n"," ").trim();
            if (isNeedToSetName) {
                memExp.name = keyWord;
                currentLB.members[keyWord] = memExp;
                isNeedToSetName = false;
            } else if (!codeCheck[keyWord]) {
                memExp.related.push(["kw", keyWord]);
                codeCheck[keyWord] = true;
            }
        }
        while ((codeMatch = aRegex.exec(liStr)) !== null) {
            const keyWord = liStr.substring(aRegex.lastIndex - codeMatch[0].length, aRegex.lastIndex).replace(htmlTagPattern, "").replaceAll("\n"," ").trim();
            if (isNeedToSetName) {
                memExp.name = keyWord;
                currentLB.members[keyWord] = memExp;
                isNeedToSetName = false;
            } else if (!linkCheck[keyWord]) {
                const linkMatch = linkRegex.exec(codeMatch[0]);
                if (linkMatch && linkMatch[1]) {
                    memExp.related.push(["a", keyWord, linkMatch[1]]);
                    linkCheck[keyWord] = true;
                }
            }
        }
    }
}

export const analyzeSidebarBlock = async (currentLB: ListingBlock, sidebarBlock: OBDataBlock, sectTags: HtmlTag[][], sectArr: string[]): Promise<void> => {
    const sectTag = sectTags[sidebarBlock.sectIndex];
    const sectStr = sectArr[sidebarBlock.sectIndex];
    let htmlCounter = sidebarBlock.tagStart + 1;
    let htmlCounterEnd = sidebarBlock.tagEnd - 1;
    let openTag = sectTag[htmlCounter];
    let closeTag: HtmlTag;
    if (openTag.type === "div" && hasClass(openTag, "content") && htmlCounter < htmlCounterEnd) {
        openTag = sectTag[++htmlCounter]; // next opentag
        closeTag = sectTag[++htmlCounter]; // close tag
        if (openTag.type === "div" && hasClass(openTag, "title") && closeTag.type === "div" && closeTag.tagState === "close") {
            const titleStr = sectStr.substring(openTag.end, closeTag.start);
            if (titleStr.includes("Return Codes")) {
                openTag = sectTag[++htmlCounter]; // next opentag
                if (openTag.type === "div" && hasClass(openTag, "dlist")) {
                    if ((openTag = sectTag[++htmlCounter]).type === "dl") {
                        while ((openTag = sectTag[++htmlCounter]).type === "dt") { // start of group
                            let level = openTag.level;
                            while ((closeTag = sectTag[++htmlCounter]).level > level) { } //skip to end of title
                            const filteredGroup: LBReturnFiltered = { name: sectStr.substring(openTag.end, closeTag.start).replace(htmlTagPattern, ""), entry: [] };
                            openTag = sectTag[++htmlCounter]; // next opentag
                            while ((closeTag = sectTag[++htmlCounter]).level > level) { } //skip to end of body
                            const itemBody = sectStr.substring(openTag.end, closeTag.start);
                            const itemRegex = RegExp(/<li>[\s\S\n]*?<\/li>/g, 'g');
                            let matchedItemArr: RegExpExecArray | null;
                            while ((matchedItemArr = itemRegex.exec(itemBody)) !== null) {
                                const item = matchedItemArr[0].replace(htmlTagPattern, "").replaceAll("\n", "");
                                filteredGroup.entry.push(item);
                            }
                            if (filteredGroup.entry.length > 0) {
                                if (currentLB.returnFiltered[filteredGroup.name]) {
                                    currentLB.returnFiltered[filteredGroup.name].entry = currentLB.returnFiltered[filteredGroup.name].entry.concat(filteredGroup.entry);
                                } else {
                                    currentLB.returnFiltered[filteredGroup.name] = filteredGroup;
                                }
                            }
                        }
                    }
                }
            } else if (titleStr.includes("Valid Usage")) {
                openTag = sectTag[++htmlCounter]; // next opentag
                if (openTag.type === "div" && hasClass(openTag, "ulist")) {
                    if ((openTag = sectTag[++htmlCounter]).type === "ul") {
                        let closeTag: HtmlTag;
                        let level = openTag.level;
                        while ((closeTag = sectTag[++htmlCounter]).level > level) { } //skip to end of ul
                        const ulStr = sectStr.substring(openTag.end, closeTag.end);
                        const liRegex = RegExp(/<li>[\s\S\n]*?<\/li>/g, 'g');
                        const entryRegex = /<span.*?class="vuid">.*?<\/span>/g;
                        const codeRegex = RegExp(/<code>[\s\S\n]*?<\/code>/g, 'g');
                        const aRegex = RegExp(/<a.*?>[\s\S\n]*?<\/a>/g, 'g');
                        const linkRegex = /href="(.*?)"/g;
                        let matchedLiArr: RegExpExecArray | null;
                        ulWhile: while ((matchedLiArr = liRegex.exec(ulStr)) !== null) {
                            const entryIdMatch = matchedLiArr[0].match(entryRegex);
                            if (entryIdMatch) {
                                const name = entryIdMatch[0].replace(htmlTagPattern, "");
                                const validUsage: LBValidUsage = { implicit: titleStr.includes("Implicit"), name, plain: matchedLiArr[0].replace(htmlTagPattern, "").replaceAll("\n", " "), related: [], commonName: name.split("-")[1] };
                                let matchedRalatedArr: RegExpExecArray | null;
                                const codeCheck: { [key: string]: boolean } = {};
                                const linkCheck: { [key: string]: boolean } = {};
                                while ((matchedRalatedArr = codeRegex.exec(matchedLiArr[0])) !== null) {
                                    const keyWord = matchedRalatedArr[0].replace(htmlTagPattern, "").replaceAll("\n", " ");
                                    if (keyWord !== "" && !codeCheck[keyWord]) {
                                        validUsage.related.push(["kw", keyWord]);
                                        codeCheck[keyWord] = true;
                                    }
                                }
                                while ((matchedRalatedArr = aRegex.exec(matchedLiArr[0])) !== null) {
                                    const keyWord = matchedRalatedArr[0].replace(htmlTagPattern, "").replaceAll("\n", " ");
                                    if (keyWord !== "" && !linkCheck[keyWord]) {
                                        const linkMatch = linkRegex.exec(matchedRalatedArr[0]);
                                        if (linkMatch && linkMatch[1]) {
                                            validUsage.related.push(["a", keyWord, linkMatch[1]]);
                                            linkCheck[keyWord] = true;
                                        }
                                    }
                                }
                                if (validUsage.name !== "") {
                                    currentLB.validUsage[validUsage.name] = validUsage;
                                }
                            } else {
                                continue ulWhile;
                            }
                        }
                    }
                }
            } else if (titleStr.includes("Host Synchronization")) {
                openTag = sectTag[++htmlCounter]; // next opentag
                if (openTag.type === "div" && hasClass(openTag, "ulist")) {
                    if ((openTag = sectTag[++htmlCounter]).type === "ul") {
                        let closeTag: HtmlTag;
                        let level = openTag.level;
                        while ((closeTag = sectTag[++htmlCounter]).level > level) { } //skip to end of ul
                        const ulStr = sectStr.substring(openTag.end, closeTag.end);
                        const liRegex = RegExp(/<li>[\s\S\n]*?<\/li>/g, 'g');
                        const codeRegex = RegExp(/<code>[\s\S\n]*?<\/code>/g, 'g');
                        const aRegex = RegExp(/<a.*?>[\s\S\n]*?<\/a>/g, 'g');
                        const linkRegex = /href="(.*?)"/g;
                        let matchedLiArr: RegExpExecArray | null;
                        while ((matchedLiArr = liRegex.exec(ulStr)) !== null) {
                            const hostSync: LBHostSync = { plain: matchedLiArr[0].replace(htmlTagPattern, "").replaceAll("\n", " "), related: [] };
                            const codeCheck: { [key: string]: boolean } = {};
                            const linkCheck: { [key: string]: boolean } = {};
                            let matchedRalatedArr: RegExpExecArray | null;
                            while ((matchedRalatedArr = codeRegex.exec(matchedLiArr[0])) !== null) {
                                const keyWord = matchedRalatedArr[0].replace(htmlTagPattern, "").replaceAll("\n", " ");
                                if (keyWord !== "" && !codeCheck[keyWord]) {
                                    hostSync.related.push(["kw", keyWord]);
                                    codeCheck[keyWord] = true;
                                }
                            }
                            while ((matchedRalatedArr = aRegex.exec(matchedLiArr[0])) !== null) {
                                const keyWord = matchedRalatedArr[0].replace(htmlTagPattern, "").replaceAll("\n", " ");
                                if (keyWord !== "" && !linkCheck[keyWord]) {
                                    const linkMatch = linkRegex.exec(matchedRalatedArr[0]);
                                    if (linkMatch && linkMatch[1]) {
                                        hostSync.related.push(["a", keyWord, linkMatch[1]]);
                                        linkCheck[keyWord] = true;
                                    }
                                }
                            }
                            currentLB.hostSync.push(hostSync);

                        }
                    }
                }
            } else if (titleStr.includes("Host Access")) {
                openTag = sectTag[++htmlCounter]; // next opentag
                if (openTag.type === "div" && hasClass(openTag, "paragraph")) {
                    let closeTag: HtmlTag;
                    let level = openTag.level;
                    while ((closeTag = sectTag[++htmlCounter]).level > level) { } //skip to end of div
                    const pStr = sectStr.substring(openTag.end, closeTag.end);
                    const pRegex = RegExp(/<p>[\s\S\n]*?<\/p>/g, 'g');
                    const codeRegex = RegExp(/<code>[\s\S\n]*?<\/code>/g, 'g');
                    const aRegex = RegExp(/<a.*?>[\s\S\n]*?<\/a>/g, 'g');
                    const linkRegex = /href="(.*?)"/g;
                    let matchedLiArr: RegExpExecArray | null;
                    while ((matchedLiArr = pRegex.exec(pStr)) !== null) {
                        // console.log("host access",new Array(30).join("\n"))
                        const hostAccess: LBHostSync = { plain: matchedLiArr[0].replace(htmlTagPattern, "").replaceAll("\n", " "), related: [] };
                        const codeCheck: { [key: string]: boolean } = {};
                        const linkCheck: { [key: string]: boolean } = {};
                        let matchedRalatedArr: RegExpExecArray | null;
                        while ((matchedRalatedArr = codeRegex.exec(matchedLiArr[0])) !== null) {
                            const keyWord = matchedRalatedArr[0].replace(htmlTagPattern, "").replaceAll("\n", " ");
                            if (keyWord !== "" && !codeCheck[keyWord]) {
                                hostAccess.related.push(["kw", keyWord]);
                                codeCheck[keyWord] = true;
                            }
                        }
                        while ((matchedRalatedArr = aRegex.exec(matchedLiArr[0])) !== null) {
                            const keyWord = matchedRalatedArr[0].replace(htmlTagPattern, "").replaceAll("\n", " ");
                            if (keyWord !== "" && !linkCheck[keyWord]) {
                                const linkMatch = linkRegex.exec(matchedRalatedArr[0]);
                                if (linkMatch && linkMatch[1]) {
                                    hostAccess.related.push(["a", keyWord, linkMatch[1]]);
                                    linkCheck[keyWord] = true;
                                }
                            }
                        }
                        currentLB.hostAccess.push(hostAccess);

                    }

                }
            } else if (titleStr.includes("Command Properties")) {
                openTag = sectTag[++htmlCounter]; // next opentag
                if (openTag.type === "table" && hasClass(openTag, "tableblock")) {
                    let closeTag: HtmlTag;
                    let level = openTag.level;
                    while ((closeTag = sectTag[++htmlCounter]).level > level) { } //skip to end of div
                    const tableStr = sectStr.substring(openTag.end, closeTag.end);
                    const cpRegex = /<p.*?>[\s\S\n]*?<\/p>/g;
                    let matchedCp = tableStr.match(cpRegex);
                    // console.log(matchedCp)
                    if (matchedCp && matchedCp.length === 5) {
                        currentLB.commandProperties.CBL0 = matchedCp[0].replace(htmlTagPattern, "").replaceAll("\n", " ");
                        currentLB.commandProperties.RPS1 = matchedCp[1].replace(htmlTagPattern, "").replaceAll("\n", " ");
                        currentLB.commandProperties.VCS2 = matchedCp[2].replace(htmlTagPattern, "").replaceAll("\n", " ");
                        currentLB.commandProperties.SQT3 = matchedCp[3].replace(htmlTagPattern, "").replaceAll("\n", " ");
                        currentLB.commandProperties.CT4 = matchedCp[4].replace(htmlTagPattern, "").replaceAll("\n", " ");
                        currentLB.commandProperties.exist = true;
                    }
                }
            } else if (titleStr.includes("Image Creation Limits")) {
                // reverse for future.
            } else {
                if (titleStr.includes("Implementor&#8217;s Note")) {
                    // neglect
                } else {
                    console.log("unknown sidebarlock", titleStr, new Array(30).join("\n"));
                }
            }
        }
    }
}
export const analyzeParagraph = async (currentLB: ListingBlock, paragraph: OBDataBlock, sectTags: HtmlTag[][], sectArr: string[]): Promise<void> => {
    const paragraphStr = sectArr[paragraph.sectIndex].substring(paragraph.start, paragraph.end);
    const codeRegex = RegExp(/<code>[\s\S\n]*?<\/code>/g, 'g');
    const aRegex = RegExp(/<a.*?>[\s\S\n]*?<\/a>/g, 'g');
    const linkRegex = /href="(.*?)"/g;
    let codeMatch: RegExpExecArray | null;
    if (!paragraphStr.includes("is defined as")) {
        currentLB.paragraph.plain += paragraphStr.replace(htmlTagPattern, "").replaceAll("\n", " ").trim();
        const codeCheck: { [key: string]: boolean } = {};
        const linkCheck: { [key: string]: boolean } = {};
        while ((codeMatch = codeRegex.exec(paragraphStr)) !== null) {
            const keyWord = paragraphStr.substring(codeRegex.lastIndex - codeMatch[0].length, codeRegex.lastIndex).replace(htmlTagPattern, "").replaceAll("\n"," ").trim();
            if (keyWord !== "" && !codeCheck[keyWord]) {
                currentLB.paragraph.related.push(["kw", keyWord]);
                codeCheck[keyWord] = true;
            }
        }
        while ((codeMatch = aRegex.exec(paragraphStr)) !== null) {
            const keyWord = paragraphStr.substring(aRegex.lastIndex - codeMatch[0].length, aRegex.lastIndex).replace(htmlTagPattern, "").replaceAll("\n"," ").trim();
            if (keyWord !== "" && !linkCheck[keyWord]) {
                const linkMatch = linkRegex.exec(codeMatch[0]);
                if (linkMatch && linkMatch[1]) {
                    currentLB.paragraph.related.push(["a", keyWord, linkMatch[1]]);
                    linkCheck[keyWord] = true;
                }
            }
        }
    }
}
export const analyzeNote = async (currentLB: ListingBlock, note: OBDataBlock, sectTags: HtmlTag[][], sectArr: string[]): Promise<void> => {
    const noteStr = sectArr[note.sectIndex].substring(note.start, note.end);
    const codeRegex = RegExp(/<code>[\s\S\n]*?<\/code>/g, 'g');
    const aRegex = RegExp(/<a.*?>[\s\S\n]*?<\/a>/g, 'g');
    const linkRegex = /href="(.*?)"/g;
    let codeMatch: RegExpExecArray | null;
    const codeCheck: { [key: string]: boolean } = {};
    const linkCheck: { [key: string]: boolean } = {};
    currentLB.notes.plain += noteStr.replace(htmlTagPattern, "").replaceAll("\n", " ").trim();
    while ((codeMatch = codeRegex.exec(noteStr)) !== null) {
        const keyWord = noteStr.substring(codeRegex.lastIndex - codeMatch[0].length, codeRegex.lastIndex).replace(htmlTagPattern, "").replaceAll("\n"," ").trim();
        if (keyWord !== "" && !codeCheck[keyWord]) {
            currentLB.notes.related.push(["kw", keyWord]);
            codeCheck[keyWord] = true;
        }
        // if (!currentLB.notes.related.includes(keyWord)) {
        //     currentLB.notes.related.push(keyWord);
        // }
    }
    while ((codeMatch = aRegex.exec(noteStr)) !== null) {
        const keyWord = noteStr.substring(aRegex.lastIndex - codeMatch[0].length, aRegex.lastIndex).replace(htmlTagPattern, "").replaceAll("\n"," ").trim();
        if (keyWord !== "" && !linkCheck[keyWord]) {
            const linkMatch = linkRegex.exec(noteStr);
            if (linkMatch && linkMatch[1]) {
                currentLB.notes.related.push(["a", keyWord, linkMatch[1]]);
                linkCheck[keyWord] = true;
            }
        }
    }

}

export const debugReportedKnownData = async (wkConfig: WKConfig) => {
    await writeFile(`${wkConfig.gConfig.debugRoot}/parsed/${wkConfig.id}-parsed.json`, JSON.stringify(wkConfig.reportedKnownData));
}