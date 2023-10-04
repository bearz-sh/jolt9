/**
 * https://github.com/sindresorhus/windows-release/blob/main/index.js
 */
import { OS_RELEASE, exec, execSync, scriptRunner } from "../../deps.ts";


const names = new Map([
	['10.0.2', '11'], // It's unclear whether future Windows 11 versions will use this version scheme: https://github.com/sindresorhus/windows-release/pull/26/files#r744945281
	['10.0', '10'],
	['6.3', '8.1'],
	['6.2', '8'],
	['6.1', '7'],
	['6.0', 'Vista'],
	['5.2', 'Server 2003'],
	['5.1', 'XP'],
	['5.0', '2000'],
	['4.90', 'ME'],
	['4.10', '98'],
	['4.03', '95'],
	['4.00', '95'],
]);

export async function win32Release(release?: string)
{
    // Reference: https://www.gaijin.at/en/lstwinver.php
    // Windows 11 reference: https://docs.microsoft.com/en-us/windows/release-health/windows11-release-information

    release ??= OS_RELEASE;
    if (!release)
    {
        throw new Error("Unable to determine Windows version");
    }

	const version = /(\d+\.\d+)(?:\.(\d+))?/.exec(release);
	if (version === null) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	let ver = version[1] || '';
	const build = version[2] || '';

	// Server 2008, 2012, 2016, and 2019 versions are ambiguous with desktop versions and must be detected at runtime.
	// If `release` is omitted or we're on a Windows system, and the version number is an ambiguous version
	// then use `wmic` to get the OS caption: https://msdn.microsoft.com/en-us/library/aa394531(v=vs.85).aspx
	// If `wmic` is obsolete (later versions of Windows 10), use PowerShell instead.
	// If the resulting caption contains the year 2008, 2012, 2016, 2019 or 2022, it is a server version, so return a server OS name.
	if ((!release || release === OS_RELEASE) && ['6.1', '6.2', '6.3', '10.0'].includes(ver)) {
		let stdout;
		try {
			stdout = await exec('wmic', ['os', 'get', 'Caption'], { stdout: 'piped'})
                .then(o => o.throwOrContinue().stdoutAsString);
		} catch {
            try {
                stdout = await exec('powershell', ['(Get-CimInstance -ClassName Win32_OperatingSystem).caption'], { stdout: 'piped'})
                    .then(o => o.throwOrContinue().stdoutAsString);

                // TODO: implement tracing
            } catch {
                return {
                    name: "Unknown",
                    id: "unknown",
                    version: release,
                }
            }
		}

		const year = (stdout.match(/2008|2012|2016|2019|2022/) || [])[0];

		if (year) {
			return {
                name: `Server ${year}`,
                id: `server-${year}`,
                version: release,
            }
		}
	}

	// Windows 11
	if (ver === '10.0' && build.startsWith('2')) {
		ver = '10.0.2';
	}

	const n = names.get(ver);
    return {
        name: n ?? "Unknown",
        id: n?.toLowerCase() ?? "unknown",
        version: release,
    }
}

export function win32ReleaseSync(release?: string) {
    release ??= OS_RELEASE;
    if (!release)
    {
        throw new Error("Unable to determine Windows version");
    }

	const version = /(\d+\.\d+)(?:\.(\d+))?/.exec(release);
	if (version === null) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	let ver = version[1] || '';
	const build = version[2] || '';

	// Server 2008, 2012, 2016, and 2019 versions are ambiguous with desktop versions and must be detected at runtime.
	// If `release` is omitted or we're on a Windows system, and the version number is an ambiguous version
	// then use `wmic` to get the OS caption: https://msdn.microsoft.com/en-us/library/aa394531(v=vs.85).aspx
	// If `wmic` is obsolete (later versions of Windows 10), use PowerShell instead.
	// If the resulting caption contains the year 2008, 2012, 2016, 2019 or 2022, it is a server version, so return a server OS name.
	if ((!release || release === OS_RELEASE) && ['6.1', '6.2', '6.3', '10.0'].includes(ver)) {
		let stdout;
		try {
			stdout = execSync('wmic', ['os', 'get', 'Caption'], { stdout: 'piped'})
                .throwOrContinue()
                .stdoutAsString;
		} catch {
            try {
                stdout = scriptRunner.runScriptSync("powershell", '(Get-CimInstance -ClassName Win32_OperatingSystem).caption', { stdout: 'piped'})
                .throwOrContinue()
                .stdoutAsString;
            } catch {
                return {
                    name: "Unknown",
                    id: "unknown",
                    version: ver,
                    build: build,
                }
            }
		}

		const year = (stdout.match(/2008|2012|2016|2019|2022/) || [])[0];

		if (year) {
			return {
                name: `Server ${year}`,
                id: `server-${year}`,
                version: release,
            }
		}
	}

	// Windows 11
	if (ver === '10.0' && build.startsWith('2')) {
		ver = '10.0.2';
	}

    const n = names.get(ver);
    return {
        name: n ?? "Unknown",
        id: n?.toLowerCase() ?? "unknown",
        version: release,
    }
}