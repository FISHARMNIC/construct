import parseAST from './parse';
import * as ESTree from '@babel/types';
import ASTerr, { err } from './ASTerr';
import nodes from './nodes';
import { Binding } from '@babel/traverse';
/// @ts-ignore
import { analyze } from "eslint-scope";
import { dummyMode, setDummyMode } from './cpp';


interface nodeInfo {
  type: string,
  left?: buildInfo,
  right?: buildInfo
}

export interface buildInfo {
  content: string;
  info: nodeInfo;
}

const bindings = new Map<ESTree.Identifier, Binding>();

export function walk(node: ESTree.Node, dummy: boolean = false): buildInfo[] {

  setDummyMode(dummy);

  let build: buildInfo[] = [];

  let type = node.type;
  if (type in nodes) {
    build.push(nodes[node.type](node, build));
  }
  else {
    ASTerr(node, `Unable to handle node "${type}"`);
  }

  setDummyMode(false);

  return build;
}

// Use to make sure that the return of a `walk` only has one item
export function walk_requireSingle(node: ESTree.Node, err: string = "Expected single value", dummy: boolean = false): buildInfo
{
  let bInfo: buildInfo[] = walk(node, dummy);

  if(bInfo.length != 1)
  {
    ASTerr(node, err);
  }
  
  return bInfo[0];
}


export function walkBody(body: ESTree.Statement[], dummy: boolean = false): string[] {

  let output: string[] = [];

  for (const statement of body) {
    let info: buildInfo[] | string[] = walk(statement, dummy);

    let strinfo = info.map((v: buildInfo | undefined): string => {
      if (v == undefined) {
        console.log("[INTERNAL ERROR] Something didnt return a buildinfo");
        process.exit(1);
      }
      return v.content;
    })

    output.push(...strinfo);
  }

  return output;
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