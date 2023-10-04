import { exec, execSync } from "../../deps.ts";
import { IPkgOperation, IPkgOperationType } from "../pkgmgr/interfaces.ts";


async function runCommand(cmd: string, op: IPkgOperationType, pkg: string[] | string, useName = false) {
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

        const splat = [cmd]
        if (useName) {
            splat.push("--name");
        } else {
            splat.push("--id");
        }

        splat.push(id);
        if (version)
            splat.push("--version", version);

        const o = await exec('winget', splat);
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

function runCommandSync(cmd: string, op: IPkgOperationType, pkg: string[] | string, useName = false): IPkgOperation[] {
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

        const splat = [cmd]
        if (useName) {
            splat.push("--name");
        } else {
            splat.push("--id");
        }

        splat.push(id);
        if (version)
            splat.push("--version", version);

        const o = execSync('winget', splat);
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


export function install(pkg: string[] | string, useName = false) {
    return runCommand("install", "install", pkg, useName);
}

export function installSync(pkg: string[] | string, useName = false) {
    return runCommandSync("install", "install", pkg, useName);
}


export function upgrade(pkg: string[] | string, useName = false) {
    return runCommand("upgrade", "upgrade", pkg, useName);
}

export function upgradeSync(pkg: string[] | string, useName = false) {
    return runCommandSync("upgrade", "upgrade", pkg, useName);
}

export function uninstall(pkg: string[] | string, useName = false) {
    return runCommand("uninstall", "uninstall", pkg, useName);
}

export function uninstallSync(pkg: string[] | string, useName = false) {
    return runCommandSync("uninstall", "uninstall", pkg, useName);
}