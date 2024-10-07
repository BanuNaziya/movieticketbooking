"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const child_process = require("child_process");
const utils = require("./utils");
class JavapContentProvider {
    constructor() {
        this.onDidChangeEmitter = new vscode.EventEmitter();
        this.onDidChange = this.onDidChangeEmitter.event;
    }
    provideTextDocumentContent(uri) {
        return new Promise((resolve, _reject) => {
            var _a, _b;
            let javapArgs = ["-c", "-constants", "-private"];
            if (/\.bytecode\.verbose$/.test(uri.fsPath)) {
                javapArgs.push("-verbose", "-l");
            }
            else if (!/\.bytecode$/.test(uri.fsPath)) {
                throw new Error("invalid file extension");
            }
            if (utils.isInJar(uri.fsPath)) {
                javapArgs.push(utils.classFile("jar:file:" + uri.path.replace(/ /g, "%20")));
            }
            else {
                javapArgs.push(utils.classFile(uri.fsPath));
            }
            utils.output.appendLine(["Command:", "javap", ...javapArgs].join(" "));
            const command = child_process.execFile("javap", javapArgs);
            let stdout = "";
            let stderr = "";
            (_a = command.stdout) === null || _a === void 0 ? void 0 : _a.on("data", (data) => {
                stdout += data.toString();
            });
            (_b = command.stderr) === null || _b === void 0 ? void 0 : _b.on("data", (data) => {
                stderr += data.toString();
            });
            command.on("close", (code) => {
                if (code === 0)
                    resolve(stdout);
                else {
                    utils.output.appendLine("Command Failed:");
                    utils.output.appendLine(stderr.replace(/^/gm, "\t")); // indent stderr
                    throw new Error(stderr);
                }
            });
            command.on("error", (error) => {
                utils.output.appendLine(`Command Failed: ${error.message}`);
                throw new Error(error.message);
            });
        });
    }
}
exports.default = JavapContentProvider;
//# sourceMappingURL=JavapContentProvider.js.map