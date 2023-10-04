/**
 * 
 * https://github.com/sindresorhus/macos-release/blob/main/index.js
 */

import { IS_DARWIN, OS_RELEASE, readTextFile, readTextFileSync } from "../../deps.ts";

let version : string| undefined;

const nameMap = new Map([
	[23, ['Sonoma', '14']],
	[22, ['Ventura', '13']],
	[21, ['Monterey', '12']],
	[20, ['Big Sur', '11']],
	[19, ['Catalina', '10.15']],
	[18, ['Mojave', '10.14']],
	[17, ['High Sierra', '10.13']],
	[16, ['Sierra', '10.12']],
	[15, ['El Capitan', '10.11']],
	[14, ['Yosemite', '10.10']],
	[13, ['Mavericks', '10.9']],
	[12, ['Mountain Lion', '10.8']],
	[11, ['Lion', '10.7']],
	[10, ['Snow Leopard', '10.6']],
	[9, ['Leopard', '10.5']],
	[8, ['Tiger', '10.4']],
	[7, ['Panther', '10.3']],
	[6, ['Jaguar', '10.2']],
	[5, ['Puma', '10.1']],
]);

const clean = (version: string) => {
	const {length} = version.split('.');

	if (length === 1) {
		return `${version}.0.0`;
	}

	if (length === 2) {
		return `${version}.0`;
	}

	return version;
};

const parseVersion = (plist: string) => {
	const matches = /<key>ProductVersion<\/key>\s*<string>([\d.]+)<\/string>/.exec(plist);
	if (!matches) {
		return;
	}

	return matches[1].replace('10.16', '11');
};

export async function macOsVersion() {
    if (!IS_DARWIN) {
        return;
    }

    if (!version) {
        const file = await readTextFile('/System/Library/CoreServices/SystemVersion.plist');
        const matches = parseVersion(file);

        if (!matches) {
            return;
        }

        version = clean(matches);
    }

    return version;
}

export function macOSVersionSync() {
	if (!IS_DARWIN) {
		return;
	}

	if (!version) {
		const file = readTextFileSync('/System/Library/CoreServices/SystemVersion.plist');
		const matches = parseVersion(file);

		if (!matches) {
			return;
		}

		version = clean(matches);
	}

	return version;
}

export default function macosRelease(release?: string) {
	const v = Number((release || OS_RELEASE).split('.')[0]);

	const [name, version] = nameMap.get(v) || ['Unknown', ''];

	return {
		name,
		version,
	};
}