import fs from 'fs';
import exec, { execSync, spawnSync } from 'child_process';
import chalk from 'chalk';

const testingDir = __dirname + '/../tests';
const main = 'tsx ' + __dirname + '/../compiler/main.ts ';
const runBin = __dirname + '/../output/sh/run.sh';

let startOffset: string | undefined = process.argv[2];
let ready: boolean = startOffset == undefined;

if(!ready)
{
    console.log(`Tester starting from ${startOffset}`);
}

let maxSize = 0;
const dirList = fs.readdirSync(testingDir, {withFileTypes: true}).filter((dirent: fs.Dirent) => {
    let name = dirent.name;
    if(startOffset == name)
    {
        ready = true;
    }
    if(!dirent.isFile() || !ready)
    {
        return false;
    }
    else if(name.slice(0,2) !== '__')
    {
        if(name.length > maxSize)
            maxSize = name.length;
        return true;
    }
    else
    {
        return false;
    }
}).map((dirent: fs.Dirent) => dirent.name);

maxSize += 5;

function f(note: string, {extra = '', rightSide = true}: {extra?: string, rightSide?: boolean} = {}): string
{
    if(rightSide)
    {
        return `[${note} ${extra}`.padEnd(maxSize) + ']';
    }
    else
    {
        return '[' + `${note} ${extra}]`.padStart(maxSize);
    }
}

function search(file: string, lookingFor: string): string
{
    lookingFor += '\n';

    const fullDir: string = testingDir + '/' + file;
    const fileContents: string = fs.readFileSync(fullDir).toString();

    const expectsStart: number = fileContents.indexOf(lookingFor);
    
    if(expectsStart == -1)
    {
        // @ts-ignore
        throw new Error(chalk.red(`Unable to find: ${lookingFor}--> Looking in file: ${fullDir}\n--> Make sure that there is no space after ${lookingFor.substring(0,lookingFor.length - 1)} before the new line`));
    }

    let captured = fileContents.substring(expectsStart + lookingFor.length);

    let closes = captured.indexOf('@end');

    if(closes == -1)
    {
        throw new Error('Unable to find @end to close for: ' + lookingFor);
    }

    captured = captured.substring(0, closes - 1);

    return captured;
}

for (const file of dirList)
{
        // @ts-expect-error
        console.log(chalk.yellow(f('RUN', {extra: file})));

        const expects = search(file, '@expects');

        try {
            execSync(main + file, { encoding: 'utf8', stdio: 'pipe' });
            const output = execSync(runBin, { encoding: 'utf8', stdio: 'pipe' });
            if(output != expects)
            {
                throw {
                    stdout: '',
                    stderr: `Expected: \n---begin---\n${expects}\n---end---\n but got \n---begin---\n${output}\n---end---\n`
                }
            }
        }
        catch(err)
        {
            const stdout = err.stdout;
            const stderr = err.stderr;

            console.log(stdout, stderr);

            // @ts-expect-error
            console.log(chalk.red(f('FAIL', {rightSide: false})));

            process.exit(1);
        }

        // @ts-expect-error
        console.log(chalk.green(f('PASS', {rightSide: false})));

}