import fs from 'fs';
import exec, { execSync } from 'child_process';
import chalk from 'chalk';

const testingDir = __dirname + '/../tests';
const main = 'tsx ' + __dirname + '/../compiler/main.ts '

let maxSize = 0;
const dirList = fs.readdirSync(testingDir).filter((file: string) => {
    if(file.slice(0,2) !== '__')
    {
        if(file.length > maxSize)
            maxSize = file.length;
        return true;
    }
    else
    {
        return false;
    }
});

maxSize += 5;

function f(note: string, {extra = '', rightSide = true}: {extra?: string, rightSide?: boolean} = {})
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

for(const file of dirList)
{
        // @ts-expect-error
        console.log(chalk.yellow(f('RUN', {extra: file})));

        try {
            const stdout = execSync(main + file, { encoding: 'utf8', stdio: 'pipe' });
        }
        catch(err)
        {
            const stdout = err.stdout;
            const stderr = err.stderr;

            console.log(stdout, stderr);

            // @ts-expect-error
            console.log(chalk.red(f('FAIL', {rightSide: true})));

            process.exit(1);
        }

        // @ts-expect-error
        console.log(chalk.green(f('PASS', {rightSide: false})));

}