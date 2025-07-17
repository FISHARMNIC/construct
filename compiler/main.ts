/*

HERE 

@todo wrap all global code in main()



*/



import { buildInfoToStr, walkBody } from './walk';
import { buildInfo } from './walk';
import { walk } from './walk';
import { exec } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';
import parseAST from './parse';
import { analyze } from 'eslint-scope';
import { allFuncs, allGlobalVars, cpp } from './cpp';
import { evaluateAllFunctions, unevaledFuncs } from './funcs';
import { err } from './ASTerr';


// dont include any other file. Make all inclusions under js.hpp
// Theres some order dependent stuff (let overloads depending on string overloads) that I need to fix
const pre = `
// Compiled with Construct 

#include "include/js.hpp"
`

const OUTFILE = __dirname + "/../output/out.cpp";
const FIXFILE = __dirname + "/../output/sh/fix.sh";

const INPUTFILE = __dirname + '/../tests/3.js';

export const ast = parseAST(INPUTFILE);
export const eslintScope = analyze(ast, { ecmaVersion: 2020 });

function begin(): void {

    /// @ts-ignore
    console.log(chalk.green(`|| (construct) JS => Cpp\n|| Compiling: "${INPUTFILE}"`));

    let output: buildInfo[] = walkBody(ast.program.body);

    // if there are any functions left over
    if(unevaledFuncs.length != 0)
    {
        evaluateAllFunctions();
    }
    if(unevaledFuncs.length != 0)
    {
        err(`Unable to evaluate functions: [${unevaledFuncs.map((value: any): string => value.func.id.name).join(", ")}]`);
    }

    output.forEach((info: buildInfo): void => {
    // console.log("REPLACEEEEE", info.replace)
    if(info.replace && info.replace.ready && info.replace.with)
    {
      let repwith = buildInfoToStr(info.replace.with);
      let build = "";
      if(info.replace.surroundings)
      {
        build += info.replace.surroundings[0];
        build += repwith.join("\n");
        build += info.replace.surroundings[1];
      }
      else
      {
        build = repwith.join("\n");
      }

      info.content = build;
    }
  })

    let output_str: string[] = buildInfoToStr(output);

    // console.log(...output.map((value: buildInfo): any => {
    //     return {
    //         content: value.content,
    //         with: value.replace?.with,
    //         ready: value.replace?.ready
    //     }
    // }))

    let ostr: string = pre;

    allGlobalVars.forEach((variable) => {
        ostr += variable.type + " " + variable.name + ";\n";
    })

    ostr += output_str.join("\n");

    // @todo integrate this into cpp.variables.create instead. This here is temporary
    // eslintScope.globalScope?.variables.forEach((variable): void => {
    //     let idents = variable.identifiers;
    //     if(idents.length != 1)
    //     {
    //         err(`@todo global identifier "${variable.name}" has multiple identifiers?`);
    //     }
    //     else
    //     {
    //         let binding = cpp.variables.get(variable.identifiers[0]);
    //         if(binding !== null && binding !== undefined)
    //         {
    //             ostr = (`${binding.type} ${binding.name}\n`) + ostr;
    //         }
    //     }
    // })

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