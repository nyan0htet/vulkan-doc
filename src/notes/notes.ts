import type { LAlias, LCommand, LDataType, LEnum, LFuncPointer, LHandle, LMacro, LMacroFunc, LStruct, LUnion } from "../worker/openblock-types"
import { aliasNoteList } from "./alias"
import { commandNoteList } from "./command"
import { enumNoteList } from "./enum"
import { funcPointerNoteList } from "./func-pointer"
import { handleNoteList } from "./handle"
import { macroNoteList } from "./macro"
import { macroFuncNoteList } from "./macro-func"
import { structNoteList } from "./struct"
import { unionNoteList } from "./union"

export type NoteType = {
    Struct: NoteMember<LStruct>,
    Union: NoteMember<LUnion>,
    Enum: NoteMember<LEnum>,
    Alias: NoteMember<LAlias>,
    FuncPointer: NoteMember<LFuncPointer>,
    Handle: NoteMember<LHandle>,
    Macro: NoteMember<LMacro>,
    MacroFunc: NoteMember<LMacroFunc>,
    Command: NoteMember<LCommand>
}
export type NoteMember<T extends LDataType> = {
    [key: string]: T
}
export const note: NoteType = {
    Struct: structNoteList,
    Union: unionNoteList,
    Enum: enumNoteList,
    Alias: aliasNoteList,
    FuncPointer: funcPointerNoteList,
    Handle: handleNoteList,
    Macro: macroNoteList,
    MacroFunc: macroFuncNoteList,
    Command: commandNoteList,
}