import { writeFile } from "fs/promises";
import type { HtmlTag } from "./parser-html";
import type { WKConfig } from "./parser-worker";
import { hasClass, parseOpenblock, parseExplanation, debugUnknownClassinTag, report, type SectLv, type SourceData, type TagExplanation } from "./parser-sect";
import { debugEachUnknownClass } from "./worker-lib";

export const parseSect4 = async (wkConfig: WKConfig, {openblock, source, sourceTags, sectionIndex }: SourceData, upLevel: SectLv, htmlCounter: number) => {
    htmlCounter++; // skip div class sect4
    let currentTag: HtmlTag = sourceTags[htmlCounter];
    let currentLv = undefined as unknown as SectLv;
    let sect4Explanation: TagExplanation[] = undefined as unknown as TagExplanation[];
    let unknownSect4Class: string[] = [];
    //for sect1 name.
    if (currentTag.type === "h5") {
        htmlCounter += 2;
        report(wkConfig, 2);
        currentTag = sourceTags[htmlCounter];
        currentLv = { tag: [...upLevel.tag], nameStart: currentTag.end, nameEnd: 0 };
        while (currentTag.type !== "h5") {
            currentTag = sourceTags[++htmlCounter];
            report(wkConfig);
        }
        currentLv.nameEnd = currentTag.start;
        const namestring = source.substring(currentLv.nameStart, currentLv.nameEnd);
        currentLv.tag.push(namestring);
        sect4Explanation = [];
        wkConfig.tagExpalantion[namestring] = { upTag: [...upLevel.tag], list: sect4Explanation };
        htmlCounter++;
        report(wkConfig);
    }
    while (sourceTags[htmlCounter] && sourceTags[htmlCounter].level > 4) {
        currentTag = sourceTags[htmlCounter];
        if (currentTag && currentTag.level === 5 && currentTag.tagState === "open") {
            let className="";
            if (hasClass(currentTag, "openblock")) {
                const tempCounter = await parseOpenblock({ openblock, sourceTags, sectionIndex, source }, currentLv, htmlCounter);
                wkConfig.status.ob++;
                report(wkConfig, tempCounter - htmlCounter);
                htmlCounter = tempCounter;
            } else if (hasClass(currentTag, className="sect5") || hasClass(currentTag, className="paragraph") ||hasClass(currentTag, className="literalblock") || hasClass(currentTag, className="listingblock") || hasClass(currentTag, className="stemblock")|| hasClass(currentTag, className="sidebarblock") || hasClass(currentTag, className="dlist") || hasClass(currentTag, className="admonitionblock") || hasClass(currentTag, className="imageblock") || hasClass(currentTag, className="ulist") || hasClass(currentTag, className="olist") || hasClass(currentTag, className="tableblock")) {
                // listing block is example code in sect4
                // stemblock is equation in sect4.
                const tempCounter = await parseExplanation({openblock, source, sourceTags, sectionIndex }, sect4Explanation, htmlCounter,className);
                report(wkConfig, tempCounter - htmlCounter);
                htmlCounter = tempCounter;
            }else {
                // debug
                debugUnknownClassinTag(wkConfig, {openblock, source, sourceTags, sectionIndex }, 4, htmlCounter, unknownSect4Class);
            }
        }
        htmlCounter++;
        report(wkConfig);
    }
    report(wkConfig)
    if (wkConfig.gConfig.isDebug) {
        await debugEachUnknownClass(wkConfig,sectionIndex,4);
    }
    return htmlCounter;
}