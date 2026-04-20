/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';

const testingDir = __dirname + '/../tests';
const main = 'tsx ' + __dirname + '/../src/main.ts ';
const runBin = __dirname + '/../runtime/sh/run.sh';

const startOffset: string | undefined = process.argv[2];
let ready: boolean = startOffset == undefined;

interface errobj {
    stdout: string,
    stderr: string,
};

if (!ready) {
    console.log(`Tester starting from ${startOffset}`);
}

let maxSize = 0;
const dirList = fs.readdirSync(testingDir, { withFileTypes: true }).filter((dirent: fs.Dirent) => {
    const name = dirent.name;
    if (startOffset == name) {
        ready = true;
    }
    if (!dirent.isFile() || !ready) {
        return false;
    }
    else if (name.slice(0, 2) !== '__') {
        if (name.length > maxSize)
            maxSize = name.length;
        return true;
    }
    else {
        return false;
    }
}).map((dirent: fs.Dirent) => dirent.name);

maxSize += 5;

function f(note: string, { extra = '', rightSide = true }: { extra?: string, rightSide?: boolean } = {}): string {
    if (rightSide) {
        return `[${note} ${extra}`.padEnd(maxSize) + ']';
    }
    else {
        return '[' + `${note} ${extra}]`.padStart(maxSize);
    }
}

function search(file: string, lookingFor: string): string {
    lookingFor += '\n';

    const fullDir: string = testingDir + '/' + file;
    const fileContents: string = fs.readFileSync(fullDir).toString();

    const expectsStart: number = fileContents.indexOf(lookingFor);

    if (expectsStart == -1) {
        // @ts-ignore
        throw new Error(chalk.red(`Unable to find: ${lookingFor}--> Looking in file: ${fullDir}\n--> Make sure that there is no space after ${lookingFor.substring(0, lookingFor.length - 1)} before the new line`));
    }

    let captured = fileContents.substring(expectsStart + lookingFor.length);

    const closes = captured.indexOf('@end');

    if (closes == -1) {
        throw new Error('Unable to find @end to close for: ' + lookingFor);
    }

    captured = captured.substring(0, closes - 1);

    return captured;
}

function writeToInfo(pass: boolean): void {
    const dir = __dirname + '/info.txt';

    const outText = `
————————————————————————————
Test ran on  | ${(new Date).toDateString()}
————————————————————————————
Status       | ${pass ? "PASS" : "FAIL"}
————————————————————————————`

    fs.writeFileSync(dir, outText);
}

for (const file of dirList) {
    // @ts-expect-error
    console.log(chalk.yellow(f('RUN', { extra: file })));

    const expects = search(file, '@expects');

    try {
        execSync(main + file, { encoding: 'utf8', stdio: 'pipe' });
        const output = execSync(runBin, { encoding: 'utf8', stdio: 'pipe' });
        if (output != expects) {
            throw {
                stdout: '',
                stderr: `Expected: \n---begin---\n${expects}\n---end---\n but got \n---begin---\n${output}\n---end---\n`
            }
        }
    }
    catch (err) {
        const stdout = (err as errobj).stdout;
        const stderr = (err as errobj).stderr;

        console.log(stdout, stderr);

        // @ts-expect-error
        console.log(chalk.red(f('FAIL', { rightSide: false })));

        writeToInfo(false);

        process.exit(1);
    }

    // @ts-expect-error
    console.log(chalk.green(f('PASS', { rightSide: false })));

    writeToInfo(true);

}
