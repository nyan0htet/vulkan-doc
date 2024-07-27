export type BasicKeyword = "uint64_t" | "uint32_t" | "auto" | "char" | "const" | "double" | "enum" | "extern" | "float" | "inline" | "int" | "long" | "register" | "restrict" | "return" | "short" | "signed" | "sizeof" | "static" | "Union" | "typedef" | "union" | "unsigned" | "void" | "volatile" | "_Alignas" | "_Alignof" | "_Atomic" | "_Bool" | "_Complex" | "_Generic" | "_Imaginary" | "_Noreturn" | "_Static_assert" | "_Thread_local";
export type DataGroup = "Struct" | "Union" | "Enum" | "FunctionPointer" | "Alias" | "Macro" | "MacroFunction" | "Command";
type MacroParamType="string"|"number"|"object"|"general";
export type Description = [undefined, number, string, string];

/**
 "*one two|$three four|^five six"
 * = opposite,same
 $ = related
 ^ = tag
 ` = condition
 */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * start : version,tag,explanation  
 * body  : modifier, memberName, version, validUsage, explanation   
 */
export type StructT = {
    [key: `Vk${string}`]: [number, string, string, ...([string, string, number, string,string][])]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * start : version,tag,explanation  
 * body  : modifier, memberName, version, validUsage, explanation   
 */
export type UnionT = {
    [key: `Vk${string}`]: [number, string, string, ...([string, string, number, string,string][])]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type EnumValue = `0x${string & { length: 8 }}` | `0x${string & { length: 16 }}` | number | `VK_${string}`;
/**
 * start : version,tag,explanation
 * body  : value or alias, version, tag, explanation.
 */
export type EnumT = {
    [key: `Vk${string}`]: [number, string, string, ...([`VK_${string}`, [EnumValue, number, string, string][]][])]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * start : returnType,PointerPrefix
 * param : parameterDataType, parameterName, validUsage, explanation.
 */
export type FunctionPointerT = {
    [key: string]: [string, string, number, string, string, ...([string, string, string, string][])]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type AliasOrigin = `struct Vk${string}` | `union Vk${string}` | BasicKeyword | `${BasicKeyword}${string}`;
/**
 * body: aliasOrigin, version, tag, explanation
 */
export type AliasT = {
    [key: `Vk${string}`]: [AliasOrigin, number, string, string]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type MacroValue = `0x${string & { length: 8 }}` | `0x${string & { length: 16 }}` | number | `VK_${string}` | `${number} ${"U"}`;
/**
 * body : macroValue, version, tag, explanation.
 */
export type MacroT = {
    [key: `VK_${string}`]: [MacroValue, number, string, string]
};
/**
 * first  : version,tag, explanation, functionbody.
 * param : parameterDatatype, parameterName, tag, explanation.
 */
export type MacroFunctionT = {
    [key: `VK_${string}`]: [number, string, string,string,...([MacroParamType, string, string, string][])]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type FilterReturn={
    returns?:string[]
};
/**
 * start    : returnType, version, tag, explanation
 * optional : filterReturn.
 * body     : modifier, member, validUsage, explanation.  
 */
export type CommandT = {
    [key: string]: [string, number, string, string,FilterReturn,...([string, string, string, string][])]
};