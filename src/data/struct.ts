import { StructT } from "../data-type";

export const structT: StructT = {
    VkBaseInStructure: [
        1.0, "^ValidUsage Structure", "`VkBaseInStructure` can be used to facilitate iterating through a read-only structure pointer chain.",
        ["VkStructureType", "sType", 1.0, "", "`sType` is the structure type of the structure being iterated through."],
        ["const struct VkBaseInStructure *", "pNext", 1.0, "", "`pNext` is NULL or a pointer to the next structure in a structure chain."],
    ],
    VkBaseOutStructure: [
        1.0, "^ValidUsage Structure", "`VkBaseOutStructure` can be used to facilitate iterating through a structure pointer chain that returns data back to the application.",
        ["VkStructureType", "sType", 1.0, "", "`sType` is the structure type of the structure being iterated through."],
        ["struct VkBaseOutStructure *", "pNext", 1, "", "`pNext` is NULL or a pointer to the next structure in a structure chain."]
    ],
    VkOffset2D: [
        1.0, "$VkOffset3D|^CommonObject Offset", "A two-dimensional offset is defined by the structure",
        ["int32_t", "x", 1.0, "", "x is the x offset."],
        ["int32_t", "y", 1.0, "", "y is the y offset."]
    ],
    VkOffset3D: [
        1.0, "$VkOffset2D|^CommonObject Offset", "A three-dimensional offset is defined by the structure",
        ["int32_t", "x", 1.0, "", "x is the x offset."],
        ["int32_t", "y", 1.0, "", "y is the y offset."],
        ["int32_t", "z", 1.0, "", "z is the z offset."]
    ],
    VkExtent2D: [
        1.0, "$VkOffset2D VkExtent3D|^CommonObject Extent", "A two-dimensional extent is defined by the structure.",
        ["uint32_t", "width", 1.0, "", "width is the width of the extent."],
        ["uint32_t", "height", 1.0, "", "height is the height of the extent."]
    ],
    VkExtent3D: [
        1.0, "$VkOffset3D VkExtent2D|^CommonObject Extent", "A three-dimensional extent is defined by the structure",
        ["uint32_t", "width", 1.0, "", "width of the extent."],
        ["uint32_t", "height", 1.0, "", "height of the extent."],
        ["uint32_t", "depth", 1.0, "", "depth of the extent."]
    ],
    VkRect2D: [
        1.0, "^CommonObject Rectangle", "Rectangles are used to describe a specified rectangular region of pixels within an image or framebuffer. Rectangles include both an offset and an extent of the same dimensionality, as described above.",
        ["VkOffset2D", "offset", 1.0, "", "offset is a `VkOffset2D` specifying the rectangle offset."],
        ["VkExtent2D", "extent", 1.0, "", "extent is a `VkExtent2D` specifying the rectangle extent."]
    ],
    VkInstance_T: [
        1.0, "^Initialization Instances internal", "Internal by macro.not exposed."
    ],
    VkInstanceCreateInfo: [
        1.0, "^Initialization Instances", "To capture events that occur while creating or destroying an instance, an application can link a `VkDebugReportCallbackCreateInfoEXT` structure or a `VkDebugUtilsMessengerCreateInfoEXT` structure to the `pNext` element of the `VkInstanceCreateInfo` structure given to `vkCreateInstance`. This callback is only valid for the duration of the `vkCreateInstance` and the `vkDestroyInstance` call. Use `vkCreateDebugReportCallbackEXT` or `vkCreateDebugUtilsMessengerEXT` to create persistent callback objects. An application can add additional drivers by including the `VkDirectDriverLoadingListLUNARG` struct to the `pNext` element of the `VkInstanceCreateInfo` structure given to `vkCreateInstance`.",
        ["VkStructureType", "sType", 1.0, "sType must be VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO", "`sType` is a `VkStructureType` value identifying this structure."],
        ["const void *", "pNext", 1.0, "If the `pNext` chain of `VkInstanceCreateInfo` includes a `VkDebugReportCallbackCreateInfoEXT` structure, the list of enabled extensions in `ppEnabledExtensionNames` must contain `VK_EXT_debug_report`. If the pNext chain of `VkInstanceCreateInfo` includes a `VkDebugUtilsMessengerCreateInfoEXT` structure, the list of enabled extensions in `ppEnabledExtensionNames` must contain `VK_EXT_debug_utils`. If the pNext chain includes a `VkExportMetalObjectCreateInfoEXT` structure, its exportObjectType member must be either `VK_EXPORT_METAL_OBJECT_TYPE_METAL_DEVICE_BIT_EXT` or `VK_EXPORT_METAL_OBJECT_TYPE_METAL_COMMAND_QUEUE_BIT_EXT`.", "`pNext` is NULL or a pointer to a structure extending this structure."],
        ["VkInstanceCreateFlags", "flags", 1.0, "", "`flags` is a bitmask of `VkInstanceCreateFlagBits` indicating the behavior of the instance."],
        ["const VkApplicationInfo *", "pApplicationInfo", 1.0, "", "`pApplicationInfo` is NULL or a pointer to a `VkApplicationInfo` structure. If not NULL, this information helps implementations recognize behavior inherent to classes of applications. `VkApplicationInfo` is defined in detail below."],
        ["uint32_t", "enabledLayerCount", 1.0, "", "`enabledLayerCount` is the number of global layers to enable."],
        ["const char * const *", "ppEnabledLayerNames", 1.0, "", "`ppEnabledLayerNames` is a pointer to an array of `enabledLayerCount` null-terminated UTF-8 strings containing the names of layers to enable for the created instance. The layers are loaded in the order they are listed in this array, with the first array element being the closest to the application, and the last array element being the closest to the driver. See the Layers section for further details."],
        ["uint32_t", "enabledExtensionCount", 1.0, "", "`enabledExtensionCount` is the number of global extensions to enable."],
        ["const char * const *", "ppEnabledExtensionNames", 1.0, "", "`ppEnabledExtensionNames` is a pointer to an array of `enabledExtensionCount` null-terminated UTF-8 strings containing the names of extensions to enable."]
    ]
};