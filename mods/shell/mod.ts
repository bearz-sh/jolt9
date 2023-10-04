import { Ps, PsOutput, IExecOptions, IExecSyncOptions, IChildProcess, exec2, execSync2, IPsStartInfo, splat, splitArguments, findExeSync, NotFoundOnPathError, IS_WINDOWS, getOrDefault } from "./deps.ts";
import { IShell } from "./interfaces.ts";

export type ExecArgs = string | string[] | Record<string, unknown>;

function convertArgs(args?: ExecArgs) : string[] | undefined {
    if (!args)
        return undefined;

    if (Array.isArray(args))
        return args;

    if (typeof args === "string")
        return splitArguments(args);

    return splat(args as Record<string, unknown>);
}

export function exec(name: string, args?: ExecArgs, options?: IExecOptions): Promise<PsOutput> {
    const a = convertArgs(args);
    return exec2(name, a, options);
}

export function execSync(name: string, args?: ExecArgs, options?: IExecSyncOptions) : PsOutput {
    const a = convertArgs(args);
    return execSync2(name, a, options);
}

export function capture(name: string, args?: ExecArgs, options?: Omit<IExecOptions, 'stdout' | 'stdin' | 'stderr'>): Promise<PsOutput> {
    const o : IExecOptions = {
        ...options,
        stdout: 'piped',
        stderr: 'piped',
    };
    
    const a = convertArgs(args);
    return exec2(name, a, o);
}

export function captureSync(name: string, args?: ExecArgs, options?: Omit<IExecSyncOptions, 'stdout' | 'stdin' | 'stderr'>) : PsOutput {
    const o : IExecSyncOptions = {
        ...options,
        stdout: 'piped',
        stderr: 'piped',
    };

    const a = convertArgs(args);
    return execSync2(name, a, o);
}

export function spawn(name: string, args?: ExecArgs, options?: IExecOptions): IChildProcess {
    const path = findExeSync(name);
    if (!path) {
        throw new NotFoundOnPathError(name);
    }
    const a = convertArgs(args);
    const ps = new Ps({
        ...options,
        file: name,
        args: a
    });

    return ps.spawn();
}

interface IPipeResult {
    ps1: IChildProcess;
    ps2: IChildProcess;
}

export class Pipe {
    #promise?: Promise<IChildProcess>
    #data?: Uint8Array | PsOutput | ReadableStream | string | Promise<PsOutput>
    // deno-lint-ignore no-explicit-any
    #rejected?: (reason: any) => void | PromiseLike<void>
    #finally?: () => void | PromiseLike<void>

    constructor(ps1: Uint8Array | PsOutput | ReadableStream<Uint8Array> | string | Promise<PsOutput> | IChildProcess | Ps) {
        if (ps1 instanceof Uint8Array || ps1 instanceof PsOutput || ps1 instanceof ReadableStream || typeof ps1 === "string" || ps1 instanceof Promise) {
            this.#data = ps1;
            return;
        }

        this.#promise = new Promise<IChildProcess>((resolve) => {
            if (ps1 instanceof Ps) {
                resolve(ps1.spawn());
                return;
            }

            resolve(ps1 as IChildProcess);
        });
    }

    to(ps2: IChildProcess | Ps, validateCode?: (code: number) => boolean) {

        if (!this.#promise) {
    
            this.#promise = Promise.resolve(this.#data).then(d => {
                return new Promise<IChildProcess>((resolve, reject) => {    
                    const child = ps2 instanceof Ps ? ps2.spawn() : ps2;
                    if (d instanceof Uint8Array) {
                        const writer = child.stdin.getWriter();
                        writer.write(d);
                    } else if (d instanceof PsOutput) {
                        const writer = child.stdin.getWriter();
                        writer.write(d.stdout);
                    } else if (typeof d === "string") {
                        const writer = child.stdin.getWriter();
                        writer.write(new TextEncoder().encode(d));
                    } else if (d instanceof ReadableStream) {
                        d.pipeTo(child.stdin);
                    } else {
                        reject(new Error("parameter data is Unsupported data type"));
                    }

                    resolve(child);
                });
            })

            if (this.#rejected)
                this.#promise.catch(this.#rejected);

            if (this.#finally)
                this.#promise.finally(this.#finally);

            return this;
        }


        this.#promise = this.#promise.then(async (ps1) => {
            const child = ps2 instanceof Ps ? ps2.spawn() : ps2;
            await ps1.stdout.pipeTo(child.stdin);
            const st = await ps1.status;
            if (validateCode && !validateCode(st.code)) {
                throw new Error(`pipe failed with code ${st.code}`);
            }
            return child;
        });

        return this;
    }

    // deno-lint-ignore no-explicit-any
    catch(onRejected: (reason: any) => void | PromiseLike<void>) {
        if (!this.#promise)
            this.#rejected = onRejected;
        else
            this.#promise.catch(onRejected);
        return this;
    }

    finally(onFinally?: () => void | PromiseLike<void>) {
        if (!this.#promise)
            this.#finally = onFinally;
        else
            this.#promise.finally(onFinally);
        return this;
    }

    async output() : Promise<PsOutput> {
        if (!this.#promise)
            throw new Error("pipe is not complete");

        const ps = await this.#promise;
        const o = await ps.output();
        const st = await ps.status;
        return new PsOutput({file: ""}, {
            stdout: o.stdout,
            stderr: o.stderr,
            code: st.code,
            success: st.success,
            signal: st.signal,
        });
    }
}

const shells = new Map<string, IShell>();

export function registerShell(name: string, shell: IShell) {
    shells.set(name, shell)
}

export function getShell(name: string) : IShell {
    const shell = shells.get(name);
    if (!shell)
        throw new Error(`shell ${name} is not registered`);
    return shell;
}

export function getDefaultShellName() {
    return getOrDefault("DEFAULT_SHELL", IS_WINDOWS ? "powershell" : "bash");
}

export function run(shell: string, inline: string, options?: IExecOptions): Promise<PsOutput>
export function run(inline: string, options?: IExecOptions): Promise<PsOutput>
export function run(): Promise<PsOutput> {
    let [shell, inline, options] = arguments;
    switch(arguments.length) {
        case 1:
            inline = shell;
            shell = getDefaultShellName();
        break;

        case 2:
            options = inline;
            inline = shell;
            shell =  getDefaultShellName();
        break;
        case 3:
            break;

        default:
            throw new Error("Invalid number of arguments")
    }
    

    return getShell(shell).run(inline, options);
}

export function runSync(shell: string, inline: string, options?: IExecOptions): PsOutput
export function runSync(inline: string, options?: IExecOptions): PsOutput
export function runSync(): PsOutput {
    let [shell, inline, options] = arguments;
    switch(arguments.length) {
        case 1:
            inline = shell;
            shell = getDefaultShellName();
        break;

        case 2:
            options = inline;
            inline = shell;
            shell =  getDefaultShellName();
        break;
        case 3:
            break;

        default:
            throw new Error("Invalid number of arguments")
    }

    return getShell(shell).runSync(inline, options);
}

export function script(shell: string, file: string, options?: IExecOptions): Promise<PsOutput>
export function script(file: string, options?: IExecOptions): Promise<PsOutput>
export function script(): Promise<PsOutput> {
    let [shell, file, options] = arguments;
    switch(arguments.length) {
        case 1:
            file = shell;
            shell = getDefaultShellName();
        break;

        case 2:
            options = file;
            file = shell;
            shell =  getDefaultShellName();
        break;
        case 3:
            break;

        default:
            throw new Error("Invalid number of arguments")
    }

    return getShell(shell).script(file, options);
}

export function scriptSync(shell: string, file: string, options?: IExecOptions): PsOutput
export function scriptSync(file: string, options?: IExecOptions): PsOutput
export function scriptSync(): PsOutput {
    let [shell, file, options] = arguments;
    switch(arguments.length) {
        case 1:
            file = shell;
            shell = getDefaultShellName();
        break;

        case 2:
            options = file;
            file = shell;
            shell =  getDefaultShellName();
        break;
        case 3:
            break;

        default:
            throw new Error("Invalid number of arguments")
    }

    return getShell(shell).scriptSync(file, options);
}

export function pipe(data: Uint8Array | PsOutput | ReadableStream | string | Promise<PsOutput> | IChildProcess | Ps) : Pipe {
    return new Pipe(data);
}

export async function pipeExec(data: Uint8Array | PsOutput | ReadableStream | string | Promise<PsOutput>,  name: string, args?: ExecArgs, options?: Omit<IExecOptions, 'stdout' | 'stdin' | 'stderr'>): Promise<PsOutput> {
    const path = findExeSync(name);
    if (!path) {
        throw new NotFoundOnPathError(name);
    }
    
    const a = convertArgs(args);
    const si : IPsStartInfo = {
        ...options,
        file: name,
        args: a
    }
    const ps = new Ps(si);
    const child = ps.spawn();

    if (data instanceof Promise) {
        data = await data;
    }
    
    if (data instanceof Uint8Array) {
        const writer = child.stdin.getWriter();
        writer.write(data);
    } else if (data instanceof PsOutput) {
        const writer = child.stdin.getWriter();
        writer.write(data.stdout);
    } else if (typeof data === "string") {
        const writer = child.stdin.getWriter();
        writer.write(new TextEncoder().encode(data));
    } else if (data instanceof ReadableStream) {
        data.pipeTo(child.stdin);
    } else {
        throw new Error("parameter data is Unsupported data type");
    }

    const result = await child.output();
    const st = await child.status;
    return new PsOutput(si, {
        stdout: result.stdout,
        stderr: result.stderr,
        code: st.code,
        success: st.success,
        signal: st.signal,
    });
}