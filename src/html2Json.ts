import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { Progress } from "./lib/console";
import { getConfig, ParserWorker, type GlobalConfig, type GlobalObj } from "./lib/parser";
import { cpus } from "os";
import { appConfig } from "./config";
import { exit } from "process";

/**
 * config
 */
const debugRoot=appConfig.html2JsonPath;
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
await mkdir(`${appConfig.output}`, { recursive: true });
if (config.debug === "true") {
    progress.print("red", "Debug mode is on.");
    await mkdir(`${debugRoot}`, { recursive: true });
    await mkdir(`${debugRoot}/unparsed`, { recursive: true });
    await mkdir(`${debugRoot}/parsed`, { recursive: true });
}
progress.print("blue", `Parser will run with ${cpuCores} thread.`);
const parserW: ParserWorker[] = await ParserWorker.create(gObj,gConfig,new URL("./worker/parser-worker.ts", import.meta.url));
const parseStartTime=Date.now();
const parsedData = await ParserWorker.parse(gObj,gConfig,parserW, "deps/vkspec.html");
await writeFile(`${appConfig.output}/${appConfig.sourceJsonFile}`,JSON.stringify(parsedData));
progress.print("red","completed");
progress.print("green",`duration:${Date.now()-parseStartTime}`);
progress.print("green",`output file is ${appConfig.output}/${appConfig.sourceJsonFile}`);
await progress.stop();
setTimeout(()=>exit(0),1000);