import type { Openblock } from "./parser-html";

export type OBExplanation = { code: string[], text: string }; // code is keywords
export type OBGeneral = { preExplanation: OBExplanation[], postExplanation: OBExplanation[], name: string };
export type OBGeneralMember = { name: string, comment: string, explanation: OBExplanation };
export type VkDataType = { type: string, name: string };
// struct
export type StrutMember = { type: VkDataType[] } & OBGeneralMember;
export type OBStruct = { type: "struct", member: { [key: string]: StrutMember } } & OBGeneral;
// union
export type UnionMember = { type: VkDataType[] } & OBGeneralMember;
export type OBUnion = { type: "union", member: { [key: string]: UnionMember } } & OBGeneral;
// Enum
export type EnumMember = { isAlias: boolean, value?: string } & OBGeneralMember;
export type OBEnum = { type: "Enum", member: { [key: string]: EnumMember } } & OBGeneral;
// Function Pointer.
export type OBFuncPointer = { type: "FuncPointer", prefixMacro: string, returnType: VkDataType[], params: VkDataType[] } & OBGeneral;
// alias
export type OBAlias = { type: "Alias", origin: VkDataType, isPointer: boolean } & OBGeneral;
// macro ?
export type OBMacro = { type: "Macro", isAlias: boolean, value: string } & OBGeneral;
// MacroFunc ?

// Command
// combined.
export type OBFinal = OBStruct | OBUnion | OBEnum;
export type OBDataBlock = Openblock & { type: string }//,isParsed:boolean};
export type OBGrouping = { listingBlock: OBDataBlock | undefined, same: OBGrouping[], pre: OBDataBlock[], post: OBDataBlock[], isParsed: boolean, isSkipped: boolean, parsedLB: ListingBlock };

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
export type LBExplanation = { name: string, plain: string, related: string[] };
export type LBParagraph = { plain: string, related: string[] };
export type LBHostSync = { plain: string, related: string[] };
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
    exist:boolean
};
export type LBValidUsage = { name: string, plain: string, related: string[], implicit: boolean, commonName: string };
export type LBReturnFiltered = { name: string, entry: string[] };
export type ListingBlock = {
    main: LBStruct | LBUnion | LBEnum | LBAlias | LBFuncPointer | LBHandle | LBMacro | LBMacroFunc | LBCommand,
    same: { type: string, name: string }[],
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
