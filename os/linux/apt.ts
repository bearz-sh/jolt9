import { exec, execSync } from "../../deps.ts";
import { IPkgOperation, IPkgOperationType } from "../pkgmgr/interfaces.ts";

async function runCommand(cmd: string, op: IPkgOperationType, pkg: string[] | string, quiet = false): Promise<IPkgOperation[]> {
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
            continue;
        }

        let target = id;

        if (version)
            target = `${id}=${version}`;
            

        const splat = [cmd, target, "-y"]
        const o = await exec('apt', splat, quiet ? {stdout: "piped", stderr: "piped"} : {});
        results.push({
            name: id,
            version: version,
            operation: op,
            code: o.code,
            success: o.code === 0,
            message: o.code === 0 ? undefined : `apt failed to ${op} ${id} ${version}`
        });
    }

    return results
}

function runCommandSync(cmd: string, op: IPkgOperationType, pkg: string[] | string, quiet = false): IPkgOperation[] {
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
            continue;
        }

        let target = id;

        if (version)
            target = `${id}=${version}`;

        const splat = cmd.split(' ');
        splat.push(target, "-y");

        const o = execSync('apt', splat, quiet ? {stdout: "piped", stderr: "piped"} : {});
        results.push({
            name: id,
            version: version,
            operation: op,
            code: o.code,
            success: o.code === 0,
            message: o.code === 0 ? undefined : `apt failed to ${op} ${id} ${version}`
        });
    }

    return results;
}


export function install(pkg: string[] | string) {
    return runCommand("install", "install", pkg);
}

export function installSync(pkg: string[] | string) {
    return runCommandSync("install", "install", pkg);
}

export function upgrade(pkg: string[] | string) {
    return runCommand("install --only-upgrade", "upgrade", pkg);
}

export function upgradeSync(pkg: string[] | string) {
    return runCommandSync("install --only-upgrade", "upgrade", pkg);
}

export function uninstall(pkg: string[] | string) {
    return runCommand("remove", "uninstall", pkg);
}

export function uninstallSync(pkg: string[] | string) {
    return runCommandSync("remove", "uninstall", pkg);
}
