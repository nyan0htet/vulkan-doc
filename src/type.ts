export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type StructMemberT={
    /**data type in modifier list.*/
    dataType:string,
    /**name of member in struct.*/
    name:string,
    /**modifier and data type of member.*/
    modifier:string[],
    /**version of member since represented.*/
    version?:number,
    /**valid usage of member.*/
    validUsage?:{
        /**explanation of valid usage.*/
        explanation:string,
        /**related keywords in explanation.*/
        related:string[]
    },
    /**explanation of struct memeber.*/
    explanation:string
};
export type StructT={
    /**version number of struct.*/
    version:number,
    /**tag of struct.*/
    tags?:[],
    /**explanation of struct.*/
    expanation?:string,
    /**member array of struct.*/
    members:{[key:string]:StructMemberT}
};
export type DocData = {
    /**list of struct.*/
    "struct": {[key:string]:StructT}
};