import fs from 'fs';
import { parse, ParseResult } from '@babel/parser';

/// @todo get rid of sync to parse multiple inputs at one time
export default function parseAST(fileDir: string): ParseResult<any> {
    const CODE: string = fs.readFileSync(fileDir, 'utf-8');
    const ast = parse(CODE, {
        sourceType: 'module'
    });
    fs.writeFileSync('AST.json', JSON.stringify(ast, null, 4));
    return ast;
}
