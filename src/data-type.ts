export type BasicKeyword = "uint64_t"|"uint32_t"|"auto" | "char" | "const" | "double" | "enum" | "extern" | "float" | "inline" | "int" | "long" | "register" | "restrict" | "return" | "short" | "signed" | "sizeof" | "static" | "Union" | "typedef" | "union" | "unsigned" | "void" | "volatile" | "_Alignas" | "_Alignof" | "_Atomic" | "_Bool" | "_Complex" | "_Generic" | "_Imaginary" | "_Noreturn" | "_Static_assert" | "_Thread_local";
export type DataGroup="Struct"|"Union"|"Enum"|"FunctionPointer"|"Alias"|"Macro"|"MacroCall"|"MacroFunction"|"Command";
export type Description=[undefined,number,string,string];

/**
 * = opposite,same
 $ = related
 ^ = tag
 ` = condition
 */
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type StructT={
    // struct : [modifier, member, ?version, ?comment]
    // last : version,link,comment.
    [key:`Vk${string}`]:[number,string,string,...([string,string,number?,string?][])]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type UnionT={
    // Union : [modifier, member, ?version, ?comment]
    // last : [version,link,comment].
    [key:`VK_${string}`]:[...([string,string]|[string,string,string]|[string,string,number]|[string,string,number,string]),Description?]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type EnumValue=`0x${string & { length: 8 }}`|`0x${string & { length: 16 }}`|number|`VK_${string}`;
export type EnumT={
    // enum : [member,value,?version,?link,?comment] or [member,alias,?version,?link,?comment]
    // last : [version,link,comment].
    [key:`Vk${string}`]:[number,string,string,...([`VK_${string}`,[EnumValue,number,string,string][]][])]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * first : "returnType","Pointer"
 * param : [modifier, member, ?version, ?comment].
 * last  : [version,link,comment].
 * @example
 * typedef VkResult (VKAPI_PTR *PFN_vkCreateDebugUtilsMessengerEXT)(VkInstance instance, const VkDebugUtilsMessengerCreateInfoEXT* pCreateInfo, const VkAllocationCallbacks* pAllocator, VkDebugUtilsMessengerEXT* pMessenger);
 * typedef void (VKAPI_PTR *PFN_vkDestroyDebugUtilsMessengerEXT)(VkInstance instance, VkDebugUtilsMessengerEXT messenger, const VkAllocationCallbacks* pAllocator);
 */
export type FunctionPointerT={
    [key:string]:[string,string,...([string,string]|[string,string,string]|[string,string,number]|[string,string,number,string]),Description?]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type AliasOrigin=`struct Vk${string}`|`union Vk${string}`|BasicKeyword|`${BasicKeyword}${string}`;
export type AliasT={
    // aliasName : [AliasOrigin,?version,?link,?comment]
    [key:`Vk${string}`]:([AliasOrigin]|[AliasOrigin,string]|[AliasOrigin,string,string]|[AliasOrigin,number]|[AliasOrigin,number,string]|[AliasOrigin,number,string,string])
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
type MacroValue=`0x${string & { length: 8 }}`|`0x${string & { length: 16 }}`|number|`VK_${string}`|`${number} ${"U"}`;
export type MacroT={
    // macro : [value,?version,?link,?comment] or [alias,?version,?link,?comment]
    // last : [version,link,comment].
    [key:`VK_${string}`]:[MacroValue]|[MacroValue,string]|[MacroValue,string,string]|[MacroValue,number]|[MacroValue,number,string]|[MacroValue,number,string,string]
};
type MacroCallValue=`0x${string & { length: 8 }}`|`0x${string & { length: 16 }}`|number;
export type MacroCallT={
    // first : aliasMacro
    // param : [value,?version,?comment]
    // last  : [version,link,comment]
    [key:`VK_${string}`]:[string,...([MacroCallValue]|[MacroCallValue,string]|[MacroCallValue,number]|[MacroCallValue,number,string]),Description?]
};
/**
 * param : [modifier, member, ?version, ?comment].
 * last  : [version,link,comment].
 */
export type MacroFunctionT={
    [key:`VK_${string}`]:[...([string,string]|[string,string,string]|[string,string,number]|[string,string,number,string]),Description?]
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * first : returnType,version,tag,explanation.    
 * param : [modifier, member, validUsage, comment].  
 */
export type CommandT={
    [key:string]:[string,number,string,string,...([string,string,string,string][])]
};