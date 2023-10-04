import { exec, execSync } from "../../deps.ts";
import { IPkgOperation, IPkgOperationType } from "../pkgmgr/interfaces.ts";


async function runCommand(cmd: string, op: IPkgOperationType, pkg: string[] | string) {
    if (typeof pkg === 'string') 
        pkg = [pkg];

    const results : IPkgOperation[] = [];
    if (pkg.length === 0)
        return results;

    
    for(const p of pkg) {
        const [id, version] = p.split('@');
        if (!id) {
            results.push({
                name: p,
                version: version,
                operation: op,
                code: -1,
                success: false,
                message: `Invalid package name: ${p}`,
            });
        }

        const splat = [cmd, id, "-y"];
        if (version)
            splat.push("--version", version);

        const o = await exec('choco', splat);
        results.push({
            name: id,
            version: version,
            operation: op,
            code: o.code,
            success: o.code === 0,
            message: o.code === 0 ? undefined : `choco failed to ${op} ${id} ${version}`
        });
    }

    return results
}

function runCommandSync(cmd: string, op: IPkgOperationType, pkg: string[] | string): IPkgOperation[] {
    if (typeof pkg === 'string') 
    pkg = [pkg];

    const results : IPkgOperation[] = [];
    if (pkg.length === 0)
        return results;

    
    for(const p of pkg) {
        const [id, version] = p.split('@');
        if (!id) {
            results.push({
                name: p,
                version: version,
                operation: op,
                code: -1,
                success: false,
                message: `Invalid package name: ${p}`,
            });
        }

        const splat = [cmd, id, "-y"]
        if (version)
            splat.push("--version", version);

        const o = execSync('choco', splat);
        results.push({
            name: id,
            version: version,
            operation: op,
            code: o.code,
            success: o.code === 0,
            message: o.code === 0 ? undefined : `winget failed to ${op} ${id} ${version}`
        });
    }

    return results
}


export function install(pkg: string[] | string) {
    return runCommand("install", "install", pkg);
}

export function installSync(pkg: string[] | string) {
    return runCommandSync("install", "install", pkg);
}


export function upgrade(pkg: string[] | string) {
    return runCommand("update", "upgrade", pkg);
}

export function upgradeSync(pkg: string[] | string) {
    return runCommandSync("update", "upgrade", pkg);
}

export function uninstall(pkg: string[] | string) {
    return runCommand("uninstall", "uninstall", pkg);
}

export function uninstallSync(pkg: string[] | string) {
    return runCommandSync("uninstall", "uninstall", pkg);
}