#!/usr/bin/env tsx

import fs from 'fs';
import { parse } from '@babel/parser';

const CODE = fs.readFileSync(__dirname + '/../tests/1.js', 'utf-8');

/// @todo get rid of sync to parse multiple inputs at one time
const ast = parse(CODE);

fs.writeFileSync(__dirname + '/output/AST.json', JSON.stringify(ast, null, 4));

