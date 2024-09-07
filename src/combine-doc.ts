import { existsSync, readFileSync } from "fs";
import { appConfig } from "./config";
import { Progress } from "./lib/console";
import { note, type NoteType } from "./notes/notes";
import { writeFile } from "fs/promises";

const parsedDocsFile=`${appConfig.output}/${appConfig.parsedJsonFile}`;
// check required file
if(existsSync(parsedDocsFile)){
    Progress.log("green",`${parsedDocsFile} is existed. Ok..`);
    const parsedDocs=JSON.parse(readFileSync(parsedDocsFile,{encoding:"utf-8"})) as NoteType;
    let  dataTypeName:keyof NoteType;
    for(dataTypeName in note){
        const noteDataObj=note[dataTypeName];
        const docDataObj=parsedDocs[dataTypeName];
        let entryName:string;
        for(entryName in noteDataObj){
            docDataObj[entryName]=noteDataObj[entryName];
        }
    }
    await writeFile(`${appConfig.output}/${appConfig.sourceJsonFile}`,JSON.stringify(parsedDocs));
}else{
    Progress.log("red",`${parsedDocsFile} is not existed.`);
}