import type { Openblock } from "./parser-html";

// LRelated=keyword or link
export type LRelated=["kw",string] | ["a",string,string];
export type LExplanation = { related: LRelated[], plainTxt: string }; // code is keywords
export type LGeneral = {
    name: string, comment: string[], same: LMemberPre[], extra: {
        "hostSync": ListingBlock["hostSync"]
        "hostAccess": ListingBlock["hostAccess"]
        "commandProperties": ListingBlock["commandProperties"]
        "paragraph": ListingBlock["paragraph"]
        "notes": ListingBlock["notes"]
    }
};
export type LMemberPre = [string, string]; // classname, variable or type, name
export type LGeneralMember = { name: string, comment: string[], pre: LMemberPre[] } & LExplanation;
export type VkDataType = { type: string, name: string };
// struct
export type LStrutMember = LGeneralMember;
export type LStruct = { type: "Struct", member: { [key: string]: LStrutMember }, validUsage: ListingBlock["validUsage"] } & LGeneral;
// union
export type LUnionMember = LGeneralMember;
export type LUnion = { type: "Union", member: { [key: string]: LUnionMember }, validUsage: ListingBlock["validUsage"] } & LGeneral;
// Enum
export type LEnumMember = LBEnumMember & LExplanation;
export type LEnum = { type: "Enum", member: { [key: string]: LEnumMember } } & LGeneral;
// Function Pointer.
export type LFuncPointerParam=LBFPParam & LExplanation;
export type LFuncPointer = Omit<LBFuncPointer,"params"|"paramDetails"> & {params:LBFPParam[]} & LGeneral;
// alias
export type LAlias = LBAlias & LGeneral;
// macro ?
export type LMacro = LBMacro & LGeneral;
export type LMacroFuncParam=Omit<LGeneralMember,"pre"|"explanation"> & LExplanation;
// MacroFunc ?
export type LMacroFunc = Omit<LBMacroFunc,"params"> & LGeneral & {params:LMacroFuncParam[]};
export type LHandle = LBHandle & LGeneral;
// Command
export type LCommandParam=LFuncPointerParam;
export type LCommand = Omit<LBCommand,"params"|"paramDetails"> & {params:LCommandParam[]} & LGeneral;
// combined.
export type LDataType = LStruct | LUnion | LEnum|LAlias| LMacro | LFuncPointer | LMacroFunc | LHandle | LCommand;
export type OBDataBlock = Openblock & { type: string }//,isParsed:boolean};
export type OBGrouping = { listingBlock: OBDataBlock | undefined, same: OBGrouping[], pre: OBDataBlock[], post: OBDataBlock[], isSkipped: boolean, parsed: LDataType };

export type LBStructMember = { name: string, comment: string[], pre: [string, string][] };
export type LBStruct = { type: "Struct", name: string, comment: string[], member: { [key: string]: LBStructMember } };
export type LBUnion = { type: "Union", name: string, comment: string[], member: { [key: string]: LBStructMember } };
export type LBEnumMember = { name: string, value: string, condition: string, comment: string[], type: "number" | "bitFlag" | "alias", alias: string };
export type LBEnum = { type: "Enum", name: string, comment: string[], member: { [key: string]: LBEnumMember } };
export type LBAlias = { type: "Alias", name: string, comment: string[], srcType: string, aliasClass: string, isSrcPointer: boolean };
export type LBFPReturn = [string, string]; // classname,type
export type LBFPParam = { name: string, pre: [string, string][] }; // parameter name,[class,dataType]
export type LBFuncPointer = { type: "FuncPointer", name: string, comment: string[], returns: LBFPReturn[], macro: string, params: string[], paramDetails: { [key: string]: LBFPParam } };
export type LBHandle = { type: "Handle", name: string, caller: string, comment: string[] };
export type LBMacro = { type: "Macro", name: string, value: string, comment: string[] };
export type LBMacroFunc = { type: "MacroFunc", name: string, body: string, comment: string[], params: string[] };
export type LBCommand = { type: "Command", name: string, comment: string[], returns: LBFPReturn[], params: string[], paramDetails: { [key: string]: LBFPParam } };
// type: "FunctionPointer" | "Alias" | "Macro" | "MacroFunction" | "Command",
export type LBExplanation = { name: string, plain: string, related: LRelated[] };
export type LBParagraph = { plain: string, related: LRelated[] };
export type LBHostSync = { plain: string, related: LRelated[] };
export type LBCommandProperties = {
    /**Command Buffer Levels */
    CBL0: string,
    /**Render Pass Scope */
    RPS1: string,
    /**Video Coding Scope */
    VCS2: string,
    /**Supported Queue Types */
    SQT3: string,
    /**Command Type */
    CT4: string,
    exist: boolean
};
export type LBValidUsage = { name: string, plain: string, related: LRelated[], implicit: boolean, commonName: string };
export type LBReturnFiltered = { name: string, entry: string[] };
export type ListingBlock = {
    main: LBStruct | LBUnion | LBEnum | LBAlias | LBFuncPointer | LBHandle | LBMacro | LBMacroFunc | LBCommand,
    same: { type: keyof ReportedKnownData, name: string }[],
    members: { [key: string]: LBExplanation },           // ulist
    paragraph: LBParagraph,                         // paragraph
    validUsage: { [key: string]: LBValidUsage },         // sidebarblock
    hostSync: LBHostSync[],                              // sidebarblock
    hostAccess: LBHostSync[],                            // sidebarblock
    commandProperties: LBCommandProperties,              // sidebarblock
    returnFiltered: { [key: string]: LBReturnFiltered }  // dlist
    notes: LBParagraph,                             // admonitionblock note
    table?: LBExplanation[],                             // tableblock
}

export type ReportedKnownData = {
    Struct: { [key: string]: LDataType },
    Union: { [key: string]: LDataType },
    Enum: { [key: string]: LDataType },
    Alias: { [key: string]: LDataType },
    FuncPointer: { [key: string]: LDataType },
    Handle: { [key: string]: LDataType },
    Macro: { [key: string]: LDataType },
    MacroFunc: { [key: string]: LDataType },
    Command: { [key: string]: LDataType }
}
export type ReportedUnknownData = string[];