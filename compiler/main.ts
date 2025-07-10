import parseAST from './parse';
import * as ESTree from '@babel/types';
import ASTerr from './ASTerr';
import nodes from './nodes';

const INPUTFILE = __dirname + '/../tests/1.js';

interface nodeInfo
{
  type?:string
}

export interface buildInfo
{
  content: string;
  info: nodeInfo;
}

export let ast = parseAST(INPUTFILE);
export function walk(node: ESTree.Node): buildInfo[]
{
  let build: buildInfo[] = [];

  let type = node.type;
  if(type in nodes)
  {
    build.push(nodes[node.type](node, build));
  }
  else
  {
    ASTerr(node, `Unable to handle node "${type}"`);
  }

  return build;
}

let output: string[] = [];

for(const statement of ast.program.body)
{
  let info: buildInfo[] | string[] = walk(statement);

  let strinfo = info.map((v: buildInfo): string => {
    return v.content;
  })

  output.push(...strinfo);
}




// traverse(ast, {
//   VariableDeclaration(path: NodePath<ESTree.VariableDeclaration>) {
//     const node = path.node;
//     const kind = node.kind; // const, let, var

//     // Can be multiple declarators, like "let a, b";
//     node.declarations.forEach((dec: ESTree.VariableDeclarator): void => {
//       const value = dec.init;
//       const ident = dec.id;

//       if (ESTree.isIdentifier(ident)) {
//         const name = ident.name;
//         console.log('Variable name:', name);
//         ident.skip();
//       }
//       else
//       {
//         ASTerr(node, "Non-simple variable declaration (destructuring?) not implemented");
//       }

//       if (ESTree.isLiteral(dec.init)) {
//         console.log('Initial value:', dec.init.value);
//       } else if (dec.init) {
//         console.log('Init type:', dec.init.type);
//       }
//     })
//   },

//   Identifier(path: NodePath<ESTree.Identifier>) {
//     console.log("ID", path.node.name)
//   }
// });