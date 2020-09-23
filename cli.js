#!/usr/bin/env node
'use strict';
const createDemo = require('.');

createDemo({
	args: process.argv.slice(2)
});