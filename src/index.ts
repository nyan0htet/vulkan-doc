import { mkdir, readFile, rm } from "fs/promises";
import { Progress } from "./lib/console";
import { getConfig, ParserWorker, type GlobalConfig, type GlobalObj } from "./lib/parser";
import { cpus } from "os";
import { note } from "./notes/notes";

/**
 * config
 */
const debugRoot="debug";
const cpuCores = cpus().length;
const cpuForWorkers = cpuCores - 1 > 3 ? cpuCores - 1 : 4;
const progress = Progress.create(cpuForWorkers);
const config = getConfig();
const gConfig:GlobalConfig={
    cpu:cpuCores,
    noOfParsers:cpuForWorkers,
    cmdConfig:config,
    isDebug:config.debug==="true",
    debugRoot
};
const gObj:GlobalObj={
    progress
}
progress.print("green", "Cofings are parsing.");
await rm(debugRoot, { force: true, recursive: true });
if (config.debug === "true") {
    progress.print("red", "Debug mode is on.");
    await mkdir(`${debugRoot}`, { recursive: true });
    await mkdir(`${debugRoot}/unparsed`, { recursive: true });
}
progress.print("blue", `Parser will run with ${cpuCores} thread.`);
const parserW: ParserWorker[] = await ParserWorker.create(gObj,gConfig,new URL("./worker/parser-worker.ts", import.meta.url));
const parseStartTime=Date.now();
const parsedData = await ParserWorker.parse(gObj,gConfig,parserW, "deps/vkspec.html", note);
progress.print("red","completed");
progress.print("green",`duration:${Date.now()-parseStartTime}`);
progress.stop();