#!/usr/bin/env tsx

/*

Main code that handles everything else. Run tsx here

*/


import { buildInfoToStr, nestLevel, walkBody } from './walk';
import * as ESTree from '@babel/types';
import { buildInfo } from './walk';
import { exec } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';
import parseAST from './parse';
import { analyze } from 'eslint-scope';
import { cpp } from './cpp';
import { evaluateAllFunctions, unevaledFuncs } from './funcs';
import { err } from './ASTerr';
import './extensions';
import { traverse } from '@babel/types';
import { ctype, getType } from './ctypes';
import { cleanAll, cleanup } from './cleanup';
import { normalTypeLists } from './iffy';

// dont include any other file. Make all inclusions under js.hpp
// Theres some order dependent stuff (let overloads depending on string overloads) that I need to fix
const pre = `
// Compiled with Construct 

#include "include/js.hpp"
`

const OUTFILE = __dirname + "/../output/out.cpp";
const FIXFILE = __dirname + "/../output/sh/fix.sh";

const DEFAULT_FILE = '9.js';

const INPUTFILE = __dirname + `/../tests/${process.argv[2] ?? DEFAULT_FILE}`;

export const ast = parseAST(INPUTFILE);
export const eslintScope = analyze(ast, { ecmaVersion: 2020 });
export let fixxes: { pre: string[], post: buildInfo[] } = {
    pre: [],
    post: []
};

cleanup.main = function () {
    fixxes = {
        pre: [],
        post: []
    };
}

// @todo clean this up and put in other file or something
// Overwrites console.log to display indentation
const saveLog = console.log;
console.log = function (...args: any[]) {
    if (nestLevel <= 0)
        saveLog(...args);
    else
        saveLog("\t".repeat(nestLevel), ...args);
}

export function replaceLaters(bInfo: buildInfo[]): void {
    bInfo.forEach((info: buildInfo): void => {
        if (info.replace && info.replace.ready && info.replace.with) {
            let repwith = buildInfoToStr(info.replace.with);
            let build = "";
            if (info.replace.surroundings) {
                build += info.replace.surroundings[0];
                build += repwith.join("\n");
                build += info.replace.surroundings[1];
            }
            else {
                build = repwith.join("\n");
            }

            info.content = build;
        }
    })
}

function begin(justWalk: boolean = false): void {

    cleanAll();

    /// @ts-ignore
    console.log(chalk.green(`|| (construct) JS => Cpp\n|| Compiling: "${INPUTFILE}"`));

    // Walk the body of the program
    let output: buildInfo[] = walkBody(ast.program.body);

    // if there are any functions left over to evaluate, try to do so now
    if (unevaledFuncs.length != 0) {
        evaluateAllFunctions();
    }

    // if some of them couldn't be evaluatated, the code couldn't be fully compiled
    // This should ideally never happen 
    if (unevaledFuncs.length != 0) {
        err(`Unable to evaluate functions: [${unevaledFuncs.map((value: any): string => value.func.id.name).join(", ")}]`);
    }

    if (!justWalk) {

        // sorting defers to the back
        // Build infos marked as defer are things like functions etc.
        // This is because in JS, they may use globals before they are declared, but c++ doesn't like that
        output.sort((a: buildInfo, b: buildInfo) => {
            if (a.defer && !b.defer) return 1;
            if (!a.defer && b.defer) return -1;
            return 0;
        });

        // Main should wrap around all of the undeferred code, like the global code 
        let ind = output.findIndex((value: buildInfo): boolean => "defer" in value);
        if (ind == -1) ind = output.length;
        ind++;
        output.pushFront({ content: `int main() {\n`, info: { type: cpp.types.FUNCTION } });
        output.splice(ind, 0, { content: "return 0;\n}", info: { type: cpp.types.FUNCTION } });
        output.push(...fixxes.post);

        // Some functions were evaluated later, so go ahead and replace their contents accoringly
        replaceLaters(output);

        let output_str: string[] = buildInfoToStr(output) //.map((v: string): string => v + ';');

        // console.log(...output.map((value: buildInfo): any => {
        //     return {
        //         content: value.content,
        //         with: value.replace?.with,
        //         ready: value.replace?.ready
        //     }
        // }))

        // start building the output with just the inclues
        let ostr: string = pre;

        // add all of the prefixes. These are like function forward defs
        ostr += fixxes.pre.join("\n") + "\n";

        // Define all global variables
        cpp.variables.globals().forEach((variable) => {
            // console.log("!!!!!", variable)
            // @todo ? Add undefined DO NOT MAKE DEFAULT UNDEFINED since the value may be defined, just only give default for let
            // @todo !important! maybe make two types of "let", one that is only numbers or strings, one that is objects and arrays, and one that is everything
            ostr += `${getType(variable)} ${variable.name} ${(getType(variable) == cpp.types.IFFY) ? "= " + cpp.cast.static(cpp.types.IFFY, "0", cpp.types.NUMBER) : ""};\n`;
        })

        // join the pre stuff with the actual compiled code
        ostr += "\n" + output_str.join("\n");

        fs.writeFileSync(OUTFILE, ostr, 'utf-8');

        /// @ts-ignore
        console.log(chalk.green("|| DONE\n|| (g++) Cpp => Bin"));

        exec(FIXFILE, (e, stdout, stderr) => {
            /// @ts-ignore
            console.log(chalk.green(`|| DONE\n|| Output in ${__dirname + "/../output/bin/a.out"}\n`));

            if (e) {
                console.error(`ERROR: ${e.message}`);
                process.exit(1);
                // return;
            }
            if (stderr) {
                console.log(`${stderr}`);
            }

            /// @ts-ignore
            console.log(chalk.green("(Ignore the errors above!)"));
        });

    }
}

let nothingChanged: boolean = true;
let i: number = 0;
while (nothingChanged) {
    let typeLists_old: Map<ESTree.Identifier, Set<string>> = new Map([...normalTypeLists.entries()].map((e) => [e[0], new Set<string>(e[1])]))
    console.log(`------------ WALKING ITERATION: ${i++} ------------`);
    begin(true);

    // @todo horribly inneficient to scan every single identifier. Instead track what changed in addType

    nothingChanged = -1 != [...normalTypeLists.entries()].findIndex((value: [ESTree.Identifier, Set<string>]) => {
        // true if something changed
        const [ident, set] = value;
        const oldSet = typeLists_old.get(ident);
        if(!oldSet || set.size !== oldSet.size)
        {
            return true;
        }

        for (const item of set) {
            if (!oldSet.has(item)) return true;
        }

        return false;
    });
}

console.log(`------- BUILDING FINAL! TOOK ${i++} PASSES --------`)
begin(false);