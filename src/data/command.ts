import { CommandT } from "../data-type";

export const commandT:CommandT={
    vkGetInstanceProcAddr:[
        "PFN_vkVoidFunction",1.0,"^Initialization Command-function-pointer","Function pointers for all Vulkan commands can be obtained by calling. `vkGetInstanceProcAddr` itself is obtained in a platform- and loader- specific manner. Typically, the loader library will export this command as a function symbol, so applications can link against the loader library, or load it dynamically and look up the symbol using platform-specific APIs. ",
        {},
        ["VkInsttance","instance","If instance is not NULL, instance must be a valid VkInstance handle","instance is the instance that the function pointer will be compatible with, or `NULL` for commands not dependent on any instance."],
        ["const char *","pName","pName must be a null-terminated UTF-8 string","pName is the name of the command to obtain."],
    ],
    vkGetDeviceProcAddr:[
        "PFN_vkVoidFunction",1.0,"^Initialization Command-function-pointer","In order to support systems with multiple Vulkan implementations, the function pointers returned by `vkGetInstanceProcAddr` may point to dispatch code that calls a different real implementation for different VkDevice objects or their child objects. The overhead of the internal dispatch for `VkDevice` objects can be avoided by obtaining device-specific function pointers for any commands that use a device or device-child object as their dispatchable object.",
        {},
        ["VkDevice","device","device must be a valid VkDevice handle","This is the logical device that the command will be executed on. It represents a connection to the Vulkan driver and hardware device."],
        ["const char *","pName","pName must be a null-terminated UTF-8 string","Specifies the name of the Vulkan device-level function to retrieve. This must be a null-terminated string."]
    ],
    vkEnumerateInstanceVersion:[
        "VkResult",1.0,"^Initialization Instances","To query the version of instance-level functionality supported by the implementation",
        {returns:["VK_SUCCESS","VK_ERROR_OUT_OF_HOST_MEMORY"]},
        ["uint32_t *","pApiVersion","`pApiVersion` must be a valid pointer to a `uint32_t` value","`pApiVersion` is a pointer to a `uint32_t`, which is the version of Vulkan supported by instance-level functionality, encoded as described in Version Numbers."]
    ],
    vkCreateInstance:[
        "VkResult",1.0,"^Initialization Instances","All required extensions for each extension in the `VkInstanceCreateInfo`::`ppEnabledExtensionNames` list must also be present in that list.To create an instance object.`vkCreateInstance` verifies that the requested layers exist. If not, `vkCreateInstance` will return `VK_ERROR_LAYER_NOT_PRESENT`. Next `vkCreateInstance` verifies that the requested extensions are supported (e.g. in the implementation or in any enabled instance layer) and if any requested extension is not supported, `vkCreateInstance` must return `VK_ERROR_EXTENSION_NOT_PRESENT`. After verifying and enabling the instance layers and extensions the `VkInstance` object is created and returned to the application. If a requested extension is only supported by a layer, both the layer and the extension need to be specified at `vkCreateInstance` time for the creation to succeed.",
        {returns:["VK_SUCCESS","VK_ERROR_OUT_OF_HOST_MEMORY","VK_ERROR_OUT_OF_DEVICE_MEMORY","VK_ERROR_INITIALIZATION_FAILED","VK_ERROR_LAYER_NOT_PRESENT","VK_ERROR_EXTENSION_NOT_PRESENT","VK_ERROR_INCOMPATIBLE_DRIVER"]},
        ["const VkInstanceCreateInfo *","pCreateInfo","`pCreateInfo` must be a valid pointer to a valid `VkInstanceCreateInfo` structure","`pCreateInfo` is a pointer to a VkInstanceCreateInfo structure controlling creation of the instance."],
        ["const VkAllocationCallbacks *","pAllocator","If `pAllocator` is not NULL, `pAllocator` must be a valid pointer to a valid `VkAllocationCallbacks` structure","`pAllocator` controls host memory allocation as described in the Memory Allocation chapter."],
        ["VkInstance *","pInstance","`pInstance` must be a valid pointer to a `VkInstance` handle","`pInstance` points a VkInstance handle in which the resulting instance is returned."]
    ]
};