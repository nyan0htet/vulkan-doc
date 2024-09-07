import { writeFile } from "fs/promises";
import type { WKConfig } from "./parser-worker";
export type HtmlTag = {
    type: string,
    attr: HtmlAttr,
    tagState: "open" | "close" | "oneline",
    level: number,
    start: number,
    end: number,
    src: string
}
type HtmlAttr = { [key: string]: string[] };
export type Openblock={tag:string[],start:number,end:number,sectIndex:number,tagStart:number,tagEnd:number}

const tagRegex = RegExp(/<[/]?[:a-z1-9]{1,}[\s\S\n]*?>/g, 'g');
const attrRegex = RegExp(/[a-z0-9]*="[0-9A-Za-z- ]*"/g, 'g');
const oneLineTag = ["col", "br", "hr", "img", "meta", "link", "input", "area", "base", "embed", "path", "wbr", "rect", "line", "circle"];
export const parseAttr = (src: string): HtmlAttr => {
    let found: RegExpExecArray | null;
    const retArr: HtmlAttr = {};
    while ((found = attrRegex.exec(src)) !== null) {
        const str = found[0].split("=");
        retArr[str[0]] = str[1].slice(1, str[1].length - 1).split(" ");
    }
    return retArr;
}
export const classifyTag = (src: string): string => {
    const tagTypeRegex = RegExp(/<[/]?([:a-z1-9]{1,})/g, 'g');
    let foundTag: RegExpExecArray | null;
    if ((foundTag = tagTypeRegex.exec(src)) !== null) {
        return foundTag[1];
    }
    return "";
}
export const parseTag = async (wkConfig: WKConfig, sect1: string, index: number): Promise<HtmlTag[]> => {
    const status = wkConfig.status;
    let reportCount = 0;
    let debugMessage = "";
    const retTags: HtmlTag[] = [];
    let foundTag: RegExpExecArray | null;
    let level = 0;
    let beforeCount=wkConfig.status.total;
    while ((foundTag = tagRegex.exec(sect1)) !== null) {
        if (level > -1) {
            const foundText = foundTag[0];
            const foundEnd = tagRegex.lastIndex;
            const foundStart = tagRegex.lastIndex - foundText.length;
            const attr = parseAttr(foundText);
            let resultTag: HtmlTag;
            const tagType = classifyTag(foundText);
            if (oneLineTag.includes(tagType)) {
                resultTag = { level: level + 1, type: tagType, tagState: "oneline", start: foundStart, end: foundEnd, attr, src: foundText };
            } else {
                if (foundText[1] === "/") {
                    resultTag = { level, type: tagType, tagState: "close", start: foundStart, end: foundEnd, attr, src: foundText };
                    level--;
                } else {
                    level++;
                    resultTag = { level, type: tagType, tagState: "open", start: foundStart, end: foundEnd, attr, src: foundText };
                }
            }
            retTags.push(resultTag);
            status.total++;
            if (++reportCount > wkConfig.reportFreq) {
                reportCount = 0;
                wkConfig.parent.postMessage(status);
            }
            if (wkConfig.gConfig.isDebug && level > -1) {
                debugMessage += `${(new Array(resultTag.level)).join("\t")}${JSON.stringify(resultTag)}\n`;
            }
        }
    }
    // status.total+=reportCount;
    wkConfig.parent.postMessage(status);
    if (retTags[retTags.length - 1].level === 0) {
        retTags.pop();
    }
    // status.total=beforeCount+retTags.length;
    // wkConfig.parent.postMessage(status);
    if (wkConfig.gConfig.isDebug) {
        await writeFile(`${wkConfig.wkDebugSect1Dir}/${index}-source.html`, sect1);
        await writeFile(`${wkConfig.wkDebugSect1Dir}/${index}-parsed.txt`, `found:${retTags[retTags.length - 1].level === 1 ? "ok" : "notOk"}\n${debugMessage}`);
    }
    return retTags;
}
