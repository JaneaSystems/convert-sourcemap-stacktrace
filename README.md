# convert-sourcemap-stacktrace

Uses a source map to convert a stack trace from running bundled / minified JavaScript code into the original stack trace.

## Install
```
yarn add -D convert-sourcemap-stacktrace
```
## Usage

- Copy `main.bundle.js.map` somewhere.

- Create a `stacktrace.txt` file containing the stack trace to convert.

- Run the `convert-sourcemap-stacktrace` script:
```
yarn convert-sourcemap-stacktrace --stack path/to/stacktrace.txt --source-map path/to/main.bundle.js.map
```

- If the bundle / minified file has another name:
```
yarn convert-sourcemap-stacktrace --bundle-name {your_bundle_name} --stack path/to/stacktrace.txt --source-map path/to/{your_bundle_name}
```

- For more information:
```
yarn convert-sourcemap-stacktrace --help
```
