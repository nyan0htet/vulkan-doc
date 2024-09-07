import type { NoteType } from "../notes/notes";
import type { LDataType } from "../parser-worker/openblock-types";

export type DependencyEntry=[string,string,number]; // type:"Struct", name, level
export type Dependency=(DependencyEntry[]|undefined)[];
export type DependencyCache={[key:string]:number};
export function doc2DepMap(doc:NoteType):Dependency{
    const retDep:Dependency=[];
    const depCache:DependencyCache={};
    let docEntry:keyof NoteType;
    for(docEntry in doc){
        const entry=doc[docEntry];
        let vkDataEntry:string;
        for(vkDataEntry in entry){
            const curEntry=entry[vkDataEntry];
            if(depCache[vkDataEntry]!==undefined){
                const level=calcDepsLv(depCache,curEntry);
                depCache[vkDataEntry]=level;
                const lvList=retDep[level] || [];
                lvList.push([curEntry.type,curEntry.name,level]);
            }
        }
    }
    return retDep;
}
export function calcDepsLv(lvCache:DependencyCache,entry:LDataType):number{
    switch(entry.type){
        case "Struct":{
            const members=entry.member;
            let memName:string;
            for(memName in members){
                const curMem=members[memName];
                curMem.pre.forEach(value=>{
                    if(value[0]==="n" || value[0]==="nc"){
                        // check cache
                        if(lvCache[value[1]]!==undefined){
                            // return from cache.
                            return lvCache[value[1]];
                        }else{
                            // check object in ds. if not exist add to unknownlist.
                        }
                    }else{
                        return 0;
                    }
                })
            }
            break;
        }
        case "Union":{
            break;
        }
        case "Enum":{
            break;
        }
        case "Handle":{
            break;
        }
        case "Macro":{
            break;
        }
        case "MacroFunc":{
            break;
        }
        case "FuncPointer":{
            break;
        }
        case "Command":{
            break;
        }
        case "Alias":{
            break;
        }
    }
    return 0;
}