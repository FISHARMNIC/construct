/*

Takes file directory and converts it into an ESTree via Babel

*/

import fs from 'fs';
import * as ESTree from '@babel/types';
import { parse, ParseResult } from '@babel/parser';

/// @todo get rid of sync to parse multiple inputs at one time
export default function parseAST(fileDir: string): ParseResult<ESTree.File> {
    const CODE: string = fs.readFileSync(fileDir, 'utf-8');
    const ast = parse(CODE, {
        sourceType: 'module',
        ranges: true,    
        // tokens: true
    });
    fs.writeFileSync('AST.json', JSON.stringify(ast, null, 4));
    return ast;
}
