import { CommandT } from "../data-type";

export const commandT:CommandT={
    vkGetInstanceProcAddr:[
        "PFN_vkVoidFunction",1.0,"^Initialization Command-function-pointer","Function pointers for all Vulkan commands can be obtained by calling. `vkGetInstanceProcAddr` itself is obtained in a platform- and loader- specific manner. Typically, the loader library will export this command as a function symbol, so applications can link against the loader library, or load it dynamically and look up the symbol using platform-specific APIs. ",
        ["VkInsttance","instance","If instance is not NULL, instance must be a valid VkInstance handle","instance is the instance that the function pointer will be compatible with, or `NULL` for commands not dependent on any instance."],
        ["const char *","pName","pName must be a null-terminated UTF-8 string","pName is the name of the command to obtain."],
    ],
    vkGetDeviceProcAddr:[
        "PFN_vkVoidFunction",1.0,"^Initialization Command-function-pointer","In order to support systems with multiple Vulkan implementations, the function pointers returned by `vkGetInstanceProcAddr` may point to dispatch code that calls a different real implementation for different VkDevice objects or their child objects. The overhead of the internal dispatch for `VkDevice` objects can be avoided by obtaining device-specific function pointers for any commands that use a device or device-child object as their dispatchable object.",
        ["VkDevice","device","device must be a valid VkDevice handle","This is the logical device that the command will be executed on. It represents a connection to the Vulkan driver and hardware device."],
        ["const char *","pName","pName must be a null-terminated UTF-8 string","Specifies the name of the Vulkan device-level function to retrieve. This must be a null-terminated string."]
    ],
    
};