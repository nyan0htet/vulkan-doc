import { MacroFunctionT } from "../data-type";

export const macroFunctionT:MacroFunctionT={
    VK_DEFINE_HANDLE:[
        1.0,"","#define VK_DEFINE_HANDLE(object) typedef struct object##_T* object;","The only dispatchable handle types are those related to device and instance management, such as `VkDevice`.",
        ["object","object","",""]
    ]
};