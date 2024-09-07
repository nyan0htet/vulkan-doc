import { existsSync, readFileSync } from "fs";
import { appConfig } from "./config";
import { Progress } from "./lib/console";
import type { NoteType } from "./notes/notes";
import { doc2DepMap } from "./dm-worker.ts/worker-lib";

const sourceJsonFile=`${appConfig.output}/${appConfig.sourceJsonFile}`;
if(existsSync(sourceJsonFile)){
    const doc=JSON.parse(readFileSync(sourceJsonFile,{encoding:"utf-8"})) as NoteType;
    const map=doc2DepMap(doc);
}else{
    Progress.log("red",`${sourceJsonFile} is not existed.`);
}