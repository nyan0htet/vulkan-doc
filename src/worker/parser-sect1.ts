import { writeFile } from "fs/promises";
import type { Openblock, HtmlTag } from "./parser-html";
import type { WKConfig } from "./parser-worker";
import { parseSect2 } from "./parse-sect2";
import { hasClass, parseOpenblock, parseExplanation, debugUnknownClassinTag, report, type SectLv, type SourceData, type TagExplanation } from "./parser-sect";
import { debugEachOpenblock, debugEachUnknownClass } from "./worker-lib";


export const parseSect1 = async (wkConfig: WKConfig, { openblock, source, sourceTags, sectionIndex }: SourceData) => {
    let currentLv: SectLv = undefined as unknown as SectLv;
    let unknownSect1Class: string[] = [];
    let htmlCounter = 0
    let currentTag: HtmlTag = sourceTags[htmlCounter];
    let sect1Explanation: TagExplanation[] = undefined as unknown as TagExplanation[];
    //for sect1 name.
    if (currentTag.type === "h2") {
        currentLv = { tag: [], nameStart: sourceTags[2].end, nameEnd: sourceTags[3].start, };
        const namestring = source.substring(currentLv.nameStart, currentLv.nameEnd);
        currentLv.tag.push(namestring);
        sect1Explanation = [];
        wkConfig.tagExpalantion[namestring] = {upTag:[],list:sect1Explanation};
        report(wkConfig, 4);
        htmlCounter += 4;
    }
    // inside section body. loop
    if (sourceTags[htmlCounter].level===1) {
        htmlCounter++; // skip sectionbody tag and go next
        while (sourceTags[htmlCounter] && sourceTags[htmlCounter].level > 1) {
            currentTag = sourceTags[htmlCounter];
            if (currentTag && currentTag.level === 2 && currentTag.tagState === "open") {
                let className="";
                if (hasClass(currentTag, "openblock")) {
                    // code block complete.
                    const tempCounter = await parseOpenblock({ openblock, source, sourceTags, sectionIndex }, currentLv, htmlCounter);
                    wkConfig.status.ob++;
                    report(wkConfig,tempCounter-htmlCounter);
                    htmlCounter = tempCounter;
                }
                else if (hasClass(currentTag, "sect2")) {
                    const tempCounter=await parseSect2(wkConfig, { openblock, source, sourceTags, sectionIndex },currentLv, htmlCounter);
                    // report(wkConfig,tempCounter-htmlCounter);
                    htmlCounter = tempCounter;
                }
                else if (hasClass(currentTag, className="paragraph") || hasClass(currentTag, className="dlist") || hasClass(currentTag, className="admonitionblock") || hasClass(currentTag, className="imageblock") || hasClass(currentTag, className="ulist") || hasClass(currentTag, className="olist") || hasClass(currentTag, className="tableblock")) {
                    // add explanation to sect1.
                    // code block complete.
                    const tempCounter=await parseExplanation({ openblock, source, sourceTags, sectionIndex },sect1Explanation,htmlCounter,className);
                    report(wkConfig,tempCounter-htmlCounter);
                    htmlCounter = tempCounter;
                } else {
                    debugUnknownClassinTag(wkConfig,{ openblock, source, sourceTags, sectionIndex },1,htmlCounter,unknownSect1Class);
                }
            }
            htmlCounter++;
            report(wkConfig);
        }
        report(wkConfig,2); // tag open and close.
    }
    if(sourceTags.length-htmlCounter>0) report(wkConfig,sourceTags.length-htmlCounter); // remained unusable tags

    if (wkConfig.gConfig.isDebug) {
        await debugEachUnknownClass(wkConfig,sectionIndex,1);
        await debugEachOpenblock(wkConfig,sectionIndex,source,openblock);
    }
}