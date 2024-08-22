import { writeFile } from "fs/promises";
import type { HtmlTag } from "./parser-html";
import type { WKConfig } from "./parser-worker";
import { hasClass, parseOpenblock, parseExplanation, debugUnknownClassinTag, report, type SectLv, type SourceData, type TagExplanation } from "./parser-sect";
import { parseSect3 } from "./parse-sect3";
import { debugEachUnknownClass } from "./worker-lib";

export const parseSect2 = async (wkConfig: WKConfig, {openblock, source, sourceTags, sectionIndex }: SourceData, upLevel: SectLv, htmlCounter: number) => {
    htmlCounter++; // skip div class sect2
    let currentTag: HtmlTag = sourceTags[htmlCounter];
    let currentLv = undefined as unknown as SectLv;
    let sect2Explanation: TagExplanation[] = undefined as unknown as TagExplanation[];
    let unknownSect2Class: string[] = [];
    //for sect1 name.
    if (currentTag.type === "h3") {
        htmlCounter += 2;
        report(wkConfig, 2);
        currentTag = sourceTags[htmlCounter];
        currentLv = { tag: [...upLevel.tag], nameStart: currentTag.end, nameEnd: 0 };
        while (currentTag.type !== "h3") {
            currentTag = sourceTags[++htmlCounter];
            report(wkConfig);
        }
        currentLv.nameEnd = currentTag.start;
        const namestring = source.substring(currentLv.nameStart, currentLv.nameEnd);
        currentLv.tag.push(namestring);
        sect2Explanation = [];
        wkConfig.tagExpalantion[namestring] = { upTag: [...upLevel.tag], list: sect2Explanation };
        htmlCounter++;
        report(wkConfig);
    }
    while (sourceTags[htmlCounter] && sourceTags[htmlCounter].level > 2) {
        currentTag = sourceTags[htmlCounter];
        if (currentTag && currentTag.level === 3 && currentTag.tagState === "open") {
            let className="";
            if (hasClass(currentTag, "openblock")) {
                const tempCounter = await parseOpenblock({ openblock, sourceTags, sectionIndex, source }, currentLv, htmlCounter);
                wkConfig.status.ob++;
                report(wkConfig, tempCounter - htmlCounter);
                htmlCounter = tempCounter;
                
            } else if (hasClass(currentTag, className="paragraph") || hasClass(currentTag, className="listingblock") || hasClass(currentTag, className="stemblock") || hasClass(currentTag, className="sidebarblock") || hasClass(currentTag, className="dlist") || hasClass(currentTag, className="admonitionblock") || hasClass(currentTag, className="imageblock") || hasClass(currentTag, className="ulist") || hasClass(currentTag, className="olist") || hasClass(currentTag, className="tableblock")) {
                // listing block is example code in sect2
                // stemblock is equation in sect2.
                // if(wkConfig.id===14){
                //     console.log("worked Sect2::::",sectionIndex,"note found",new Array(13).join("\n"))
                // }
                const tempCounter = await parseExplanation({openblock, source, sourceTags, sectionIndex }, sect2Explanation, htmlCounter,className);
                report(wkConfig, tempCounter - htmlCounter);
                htmlCounter = tempCounter;
            } else if (hasClass(currentTag, "sect3")) {
                const tempCounter = await parseSect3(wkConfig, {openblock, source, sourceTags, sectionIndex }, currentLv, htmlCounter);
                htmlCounter = tempCounter;
            } else {
                // debug
                debugUnknownClassinTag(wkConfig, {openblock, source, sourceTags, sectionIndex }, 2, htmlCounter, unknownSect2Class);
            }
        }
        htmlCounter++;
        report(wkConfig);
    }
    report(wkConfig)
    if (wkConfig.gConfig.isDebug) {
        await debugEachUnknownClass(wkConfig,sectionIndex,2);
    }
    return htmlCounter;
}