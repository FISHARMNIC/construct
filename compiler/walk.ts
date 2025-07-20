import * as ESTree from '@babel/types';
import { ASTerr_kill, err, ThrowInfo } from './ASTerr';
import nodes from './nodes';
/// @ts-ignore
import { __dummyModeGlevel, allFuncs, allVars, dummyMode, enterDummyMode, exitDummyMode, setDummyMode, tempStack } from './cpp';
import { ctype, stackInfo } from './ctypes';

// export let toReplace: replaceObj[] = [];

interface nodeInfo {
  type: ctype,              // what type is the node
  left?: buildInfo,         // info about what is on the left (not always provided)
  right?: buildInfo         // "
}

export interface replaceObj {
  ready: boolean,           // if the parenting build info is ready to be replaced
  with?: buildInfo[],       // what to replace with
  surroundings?: string[]   // [0] addes a prefix, [1] adds a suffix, for example a function definition wrapper: int main() {...}
}

export interface buildInfo {
  content: string;
  info: nodeInfo;
  defer?: boolean;      // dont place in the main function, for example like a function dec
  replace?: replaceObj; // if this exists and so does .ready, then this build info .content should be replaces with .replace.with
                        // used for fuction evaluation that may be pushed off until later
}


export let nestLevel = -1;

// Walk a block statement in dummy mode, as such that there is no side effects like variable creation
// Used to verify if a function is compileable yet
export function walkBodyDummy(body: ESTree.Statement[], beforeDelete?: (obj: stackInfo, success: boolean, errorInfo: ThrowInfo | undefined) => void): { info: buildInfo[], success: boolean, errorInfo: ThrowInfo | undefined} {

  let lastObj: stackInfo = {
    funcs: [],
    vars: []
  };

  tempStack.push(lastObj);
  // console.log("----- CREATED TEMP STACK -----", __dummyModeGlevel());

  let success = false;
  let out: buildInfo[] = [];
  let errInfo: ThrowInfo | undefined = undefined;

    // console.log(">>>>>> in", nestLevel, nestLevel + 1);
  nestLevel++;

  try {
    out = walkBody(body, true, true);
    success = true;
  }
  catch (err) {
    success = false;
    errInfo = err;
  }

  // console.log(">>>>>> out", nestLevel, nestLevel - 1);
  nestLevel--;

  if(beforeDelete)
    beforeDelete(lastObj, success, errInfo);

  ///  @todo make this more dynamic

  // clean up all temporary stuff
  lastObj.funcs.forEach((value: ESTree.Identifier): void => {
    allFuncs.delete(value);
  });

  lastObj.vars.forEach((value: ESTree.Identifier): void => {
    console.log("[dummy] deleting dummy variable", value.name);
    allVars.delete(value);
  });

  tempStack.pop();
  // console.log("----- DESTRYD TEMP STACK -----", __dummyModeGlevel())

  return {
    info: out,
    success,
    errorInfo: errInfo
  };
}

// just extract contents of buildInfo
export function buildInfoToStr(bInfo: buildInfo[]): string[] {
  return bInfo.map((value: buildInfo): string => value.content);
}

// fully walk a single node, not a collection of statements
export function walk(node: ESTree.Node, dummy: boolean = false): buildInfo[] {

  if(dummy)
  {
    enterDummyMode();
  }

  let build: buildInfo[] = [];

  let type = node.type;
  if (type in nodes) {
    build.push(nodes[node.type](node, build));
  }
  else {
    ASTerr_kill(node, `Unable to handle node "${type}"`);
  }

  if(dummy)
  {
    exitDummyMode();
  }

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

// walk a series of statement like those within the main file or the block statement of a fn
// unsafe is only to be used by walkBodyDummy
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