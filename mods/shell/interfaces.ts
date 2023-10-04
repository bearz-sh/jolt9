import { IExecSyncOptions, PsOutput, IExecOptions } from "./deps.ts";

export interface IShell {
    run(inline: string, options?: IExecOptions): Promise<PsOutput>;

    runSync(inline: string, options?: IExecSyncOptions): PsOutput;

    script(file: string, options?: IExecOptions): Promise<PsOutput>;

    scriptSync(file: string, options?: IExecSyncOptions): PsOutput;
}
