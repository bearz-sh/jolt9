import { readTextFile, readTextFileSync } from "../../deps.ts";


function parse(content: string) {
    const lines = content.split("\n");
    let name = "Unknown";
    let id = "unknown";
    let idLike = "";
    let version = "";
    let versionId = "";
    let versionCodename = "";
    let prettyName = "";
    for (const line of lines) {
        const [key, value] = line.split("=");
        switch(key) 
        {
            case "ID":
                id = value;
                break;

            case "ID_LIKE":
                idLike = value;
                break;

            case "NAME":
                name = value;
                break;

            case "VERSION":
                version = value.split(" ").find(o => o.length > 0) ?? "";
                break;

            case "VERSION_ID":
                versionId = value;
                break;

            case "VERSION_CODENAME":
                versionCodename = value;
                break;

            case "PRETTY_NAME":
                prettyName = value;
                break;
        }
    }

    return {
        id,
        idLike,
        name,
        version,
        versionId,
        versionCodename,
        prettyName,
    }
} 

export async function linuxRelease() {
    const content = await readTextFile("/etc/os-release");
    return parse(content);
}

export function linuxReleaseSync() {
    const content = readTextFileSync("/etc/os-release");
    return parse(content);
}