import fs from 'fs';
const swc = require('@swc/core');

const CODE = fs.readFileSync('../tests/1.js', 'utf-8');

/// @todo get rid of sync to parse multiple inputs at one time
const ast = swc.parseSync(CODE, {
    syntax: 'typescript',
    tsx: false,
    decorators: false,
    dynamicImport: true
  });

fs.writeFileSync('../output/AST.json', JSON.stringify(ast, null, 4));

