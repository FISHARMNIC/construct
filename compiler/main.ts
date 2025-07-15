import { walkBody } from './walk';
import { buildInfo } from './walk';
import { walk } from './walk';
import { exec } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';
import parseAST from './parse';
import { analyze } from 'eslint-scope';


// dont include any other file. Make all inclusions under js.hpp
// Theres some order dependent stuff (let overloads depending on string overloads) that I need to fix
const pre = `
// Compiled with Construct 

#include "include/js.hpp"
`

const OUTFILE = __dirname + "/../output/out.cpp";
const FIXFILE = __dirname + "/../output/sh/fix.sh";

const INPUTFILE = __dirname + '/../tests/1.js';

export const ast = parseAST(INPUTFILE);
export const eslintScope = analyze(ast, { ecmaVersion: 2020 });

function begin(): void {

    /// @ts-ignore
    console.log(chalk.green(`|| (construct) JS => Cpp\n|| Compiling: "${INPUTFILE}"`));

    let output: string[] = walkBody(ast.program.body);

    let ostr: string = pre + output.join("\n");

    fs.writeFileSync(OUTFILE, ostr, 'utf-8');

    /// @ts-ignore
    console.log(chalk.green("|| DONE\n|| (g++) Cpp => Bin"));

    exec(FIXFILE, (e, stdout, stderr) => {
        /// @ts-ignore
        console.log(chalk.green(`|| DONE\n|| Output in ${__dirname + "/../output/bin/a.out"}\n`));

        if (e) {
            console.error(`ERROR: ${e.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
        }

        /// @ts-ignore
        console.log(chalk.green("(Ignore the errors above!)"));
    });
}

begin()