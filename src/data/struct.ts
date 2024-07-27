import { StructT } from "../data-type";

export const structT:StructT={
    VkBaseInStructure:[
        1.0,"^ValidUsage Structure","`VkBaseInStructure` can be used to facilitate iterating through a read-only structure pointer chain.",
        ["VkStructureType","sType",1.0,"`sType` is the structure type of the structure being iterated through."],
        ["const struct VkBaseInStructure *","pNext",1.0,"`pNext` is NULL or a pointer to the next structure in a structure chain."],
    ],
    VkBaseOutStructure:[
        1.0,"^ValidUsage Structure","`VkBaseOutStructure` can be used to facilitate iterating through a structure pointer chain that returns data back to the application.",
        ["VkStructureType","sType",1.0,"`sType` is the structure type of the structure being iterated through."],
        ["struct VkBaseOutStructure *","pNext",1.0,"`pNext` is NULL or a pointer to the next structure in a structure chain."]
    ],
    VkOffset2D:[
        1.0,"$VkOffset3D|^CommonObject Offset","A two-dimensional offset is defined by the structure",
        ["int32_t","x",1.0,"x is the x offset."],
        ["int32_t","y",1.0,"y is the y offset."]
    ],
    VkOffset3D:[
        1.0,"$VkOffset2D|^CommonObject Offset","A three-dimensional offset is defined by the structure",
        ["int32_t","x",1.0,"x is the x offset."],
        ["int32_t","y",1.0,"y is the y offset."],
        ["int32_t","z",1.0,"z is the z offset."]
    ],
    VkExtent2D:[
        1.0,"$VkOffset2D VkExtent3D|^CommonObject Extent","A two-dimensional extent is defined by the structure.",
        ["uint32_t","width",1.0,"width is the width of the extent."],
        ["uint32_t","height",1.0,"height is the height of the extent."]
    ],
    VkExtent3D:[
        1.0,"$VkOffset3D VkExtent2D|^CommonObject Extent","A three-dimensional extent is defined by the structure",
        ["uint32_t","width",1.0,"width of the extent."],
        ["uint32_t","height",1.0,"height of the extent."],
        ["uint32_t","depth",1.0,"depth of the extent."]
    ],
    VkRect2D:[
        1.0,"^CommonObject Rectangle","Rectangles are used to describe a specified rectangular region of pixels within an image or framebuffer. Rectangles include both an offset and an extent of the same dimensionality, as described above.",
        ["VkOffset2D","offset",1.0,"offset is a `VkOffset2D` specifying the rectangle offset."],
        ["VkExtent2D","extent",1.0,"extent is a `VkExtent2D` specifying the rectangle extent."]
    ]
};