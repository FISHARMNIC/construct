import { ast } from './walk';
import { buildInfo } from './walk';
import { walk } from './walk';
import { exec } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';

const pre = `
#include "include/js.hpp"
`

const OUTFILE = __dirname + "/../output/out.cpp";
const FIXFILE = __dirname + "/../output/sh/fix.sh";

function begin(): void {

    /// @ts-ignore
    console.log(chalk.green("=== Compiling ==="));

    let output: string[] = [];

    for (const statement of ast.program.body) {
        let info: buildInfo[] | string[] = walk(statement);

        let strinfo = info.map((v: buildInfo | undefined): string => {
            if (v == undefined) {
                console.log("[INTERNAL ERROR] Something didnt return a buildinfo");
                process.exit(1);
            }
            return v.content;
        })

        output.push(...strinfo);
    }

    let ostr: string = pre + output.join("\n");

    fs.writeFileSync(OUTFILE, ostr, 'utf-8');

    /// @ts-ignore
    console.log(chalk.green("=== Fixing C++ ==="));

    exec(FIXFILE, (e, stdout, stderr) => {
        if (e) {
            console.error(`ERROR: ${e.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
        }

        /// @ts-ignore
        console.log(chalk.green("=== Done! ==="));
    });
}

begin()