import type { Optional, StructMemberT, StructT } from "../type";
import { structNoteList } from "./struct";

export type StructNoteT=Optional<StructT,keyof StructT> & {members:Optional<StructMemberT,keyof StructMemberT>};
export type StructNoteListT={[key:string]:StructNoteT};
export type NoteT={
    struct:StructNoteListT,
}
export const note:NoteT={
    struct:structNoteList
}