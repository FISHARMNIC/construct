import parseAST from './parse';
import * as ESTree from '@babel/types';
import { ASTerr_kill, err } from './ASTerr';
import nodes from './nodes';
import { Binding } from '@babel/traverse';
/// @ts-ignore
import { analyze } from "eslint-scope";
import { allFuncs, allVars, dummyMode, setDummyMode, stackInfo, tempStack } from './cpp';


interface nodeInfo {
  type: string,
  left?: buildInfo,
  right?: buildInfo
}

export interface replaceObj {
  ready: boolean,
  with?: buildInfo[],
  surroundings?: string[]
}

export interface buildInfo {
  content: string;
  info: nodeInfo;
  defer?: boolean;      // dont place in the main function, for example like a function dec
  replace?: replaceObj;
}

const bindings = new Map<ESTree.Identifier, Binding>();

// Walk a block statement in dummy mode, as such that there is no side effects like variable creation
// Used to verify if a function is compileable yet
export function walkBodyDummy(body: ESTree.Statement[]): { info: buildInfo[], success: boolean } {

  let lastObj: stackInfo = {
    funcs: [],
    vars: []
  };

  tempStack.push(lastObj);

  let success = false;
  let out: buildInfo[] = [];

  nestLevel++;

  try {
    out = walkBody(body, true, true);
    success = true;
  }
  catch (err) {
    success = false;
  }

  nestLevel--;

  ///  @todo make this more dynamic

  lastObj.funcs.forEach((value: ESTree.Identifier): void => {
    allFuncs.delete(value);
  });

  lastObj.vars.forEach((value: ESTree.Identifier): void => {
    allVars.delete(value);
  });

  tempStack.pop();

  return {
    info: out,
    success
  };
}


export let toReplace: replaceObj[] = [];

export function buildInfoToStr(bInfo: buildInfo[]): string[] {
  return bInfo.map((value: buildInfo): string => value.content);
}

export function walk(node: ESTree.Node, dummy: boolean = false): buildInfo[] {

  let oldMode = dummyMode;
  setDummyMode(dummy);

  let build: buildInfo[] = [];

  let type = node.type;
  if (type in nodes) {
    build.push(nodes[node.type](node, build));
  }
  else {
    ASTerr_kill(node, `Unable to handle node "${type}"`);
  }

  setDummyMode(oldMode);

  // used for revaling functions
  // build.forEach((info: buildInfo): void => {
  //   // console.log("REPLACEEEEE", info.replace)
  //   if(info.replace && info.replace.ready && info.replace.with)
  //   {
  //     let repwith = buildInfoToStr(info.replace.with);
  //     let build = "";
  //     if(info.replace.surroundings)
  //     {
  //       build += info.replace.surroundings[0];
  //       build += repwith.join("\n");
  //       build += info.replace.surroundings[1];
  //     }
  //     else
  //     {
  //       build = repwith.join("\n");
  //     }

  //     info.content = build;
  //   }
  // })

  return build;
}

// Use to make sure that the return of a `walk` only has one item
export function walk_requireSingle(node: ESTree.Node, err: string = "Expected single value", dummy: boolean = false): buildInfo {
  let bInfo: buildInfo[] = walk(node, dummy);

  if (bInfo.length != 1) {
    ASTerr_kill(node, err);
  }

  return bInfo[0];
}

export let nestLevel = -1;

// walk a series of statement like those within the main file or the block statement of a fn
export function walkBody(body: ESTree.Statement[], dummy: boolean = false, unsafe: boolean = false): buildInfo[] {

  //let output: string[] = [];
  let output: buildInfo[] = [];

  if (!unsafe)
    nestLevel++;

  for (const statement of body) {
    let info: buildInfo[] = walk(statement, dummy);

    let strinfo = info.map((v: buildInfo | undefined): string => {
      if (v == undefined) {
        console.log("[INTERNAL ERROR] Something didnt return a buildinfo");
        process.exit(1);
      }
      return v.content;
    })

    output.push(...info);

    //output.push(...strinfo);
  }

  if (!unsafe)
    nestLevel--;

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