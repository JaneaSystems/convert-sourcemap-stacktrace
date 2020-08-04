#!/usr/bin/env node

const yargs = require('yargs');

const argv = yargs
  .usage('Usage: yarn convert-sourcemap-stacktrace [options]')
  .option('stack', {
    description: 'Path to text file containing the stack trace to convert',
    required: true,
  })
  .option('source-map', {
    description: 'Path to source map containing the mappings for the stack trace',
    required: true,
  })
  .option('bundle-name', {
    description: 'Bundle name, to identify which lines from the stack trace should be converted',
    default: 'main.bundle.js',
  })
  .example('yarn convert-sourcemap-stacktrace --stack stacktrace.txt --source-map ./sourceMaps/main.bundle.js.map',
    'Converts the stack trace in stacktrace.txt to the original stack trace with the mappings contained in main.bundle.js.map',
  )
  .help('h')
  .alias('h', 'help')
  .epilogue('For more information, read README.md')
  .argv;

const fs = require('fs');
const { SourceMapConsumer } = require('source-map');
const stackTraceParser = require('stacktrace-parser');

const stackTraceFileLocation = argv['stack'];
const sourceMapFileLocation = argv['source-map'];
const bundleName = argv['bundle-name'];

// Read and parse stack trace from stacktrace.txt
const stack = stackTraceParser.parse(fs.readFileSync(stackTraceFileLocation, 'utf8').toString());

(async () => {
  // Read the source map for the main bundle.
  const consumer = await new SourceMapConsumer(fs.readFileSync(sourceMapFileLocation, 'utf8'));

  // For each stack trace entry from the main bundle, map to each original code position.
  const originalStack = stack.map( (stackValue) => {
    if (stackValue.file.endsWith(bundleName)) { // Only care about lines that come from the bundle.
      const originalStackValue = consumer.originalPositionFor({
        line: stackValue.lineNumber,
        column: stackValue.column - 1, // columns are considered 0-based on source-map
      });
      stackValue.lineNumber = originalStackValue.line;
      stackValue.column = originalStackValue.column + 1;
      stackValue.file = originalStackValue.source;
      stackValue.methodName = originalStackValue.name;
    }
    return stackValue;
  });

  // Reconstruct original code stack trace from the mappings found.
  let newStackTrace = '';
  originalStack.forEach( (stackValue) => {
    newStackTrace += `at ${stackValue.methodName || '<unknown>'} (${stackValue.file}:${stackValue.lineNumber}:${stackValue.column})\n`;
  });
  console.log(newStackTrace);
})();
