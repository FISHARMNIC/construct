import * as ESTree from '@babel/types';

export default function(node: ESTree.Node, ...args: any[])
{
    console.log(`[ERROR] on {${node.loc!.start.line}} : `, ...args);
    process.exit(1);
}