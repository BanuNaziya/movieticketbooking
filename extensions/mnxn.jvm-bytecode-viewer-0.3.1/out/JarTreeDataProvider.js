"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JarTreeDataProvider = exports.JarNode = void 0;
const vscode = require("vscode");
const AdmZip = require("adm-zip");
const path = require("path");
const utils = require("./utils");
class JarNode {
    constructor(jarUri, fileUri = vscode.Uri.file("/"), zip = new AdmZip(jarUri.fsPath), files = utils.zipEntries(zip)) {
        this.jarUri = jarUri;
        this.fileUri = fileUri;
        this.zip = zip;
        this.children = [];
        const groups = {};
        for (const file of files) {
            const key = file.match(/^[^/]*\/?/);
            if (key) {
                const collection = groups[key.toString()];
                if (collection)
                    collection.push(file);
                else
                    groups[key.toString()] = [file];
            }
        }
        this.children = Object.keys(groups)
            .map((childName) => new JarNode(jarUri, utils.uriJoin(this.fileUri.path, childName), this.zip, groups[childName]
            // Remove parent directory from file paths
            .map((node) => node.substr(childName.length))
            // Skip the empty path
            .filter((node) => node)))
            .sort(JarNode.compare);
    }
    getText(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var _a;
                try {
                    const localPath = uri.path.substr(uri.path.indexOf("!") + 2);
                    (_a = this.zip) === null || _a === void 0 ? void 0 : _a.readAsTextAsync(localPath, resolve);
                }
                catch (error) {
                    reject(error.toString());
                }
            });
        });
    }
    get contextValue() {
        if (this.fileUri.path === "/")
            return "jar";
        else if (this.fileUri.path.endsWith("/"))
            return "folder";
        else if (this.fileUri.path.endsWith(".class"))
            return "class";
        else
            return "file";
    }
    get label() {
        if (this.contextValue == "jar")
            return path.basename(this.jarUri.path);
        return path.basename(this.fileUri.path);
    }
    get resourceUri() {
        return vscode.Uri.parse(utils.pathJoin(this.jarUri.path + "!", this.fileUri));
    }
    get collapsibleState() {
        switch (this.contextValue) {
            case "folder":
            case "jar":
                return vscode.TreeItemCollapsibleState.Collapsed;
            default:
                return vscode.TreeItemCollapsibleState.None;
        }
    }
    get command() {
        const open = (scheme, path) => ({
            command: "vscode.open",
            arguments: [vscode.Uri.parse(path).with({ scheme })],
            title: "Open Jar Resource",
        });
        switch (this.contextValue) {
            case "file":
                return open("jar-file", this.resourceUri.path);
            case "class":
                const verbose = vscode.workspace
                    .getConfiguration("jvm-bytecode-viewer")
                    .get("defaultToVerboseOutput");
                return open("javap", utils.bytecodeFile(this.resourceUri.path, { verbose }));
            default:
                return undefined;
        }
    }
    static compare(l, r) {
        // show folders before other files
        if (l.contextValue !== r.contextValue) {
            if (l.contextValue == "folder")
                return -1;
            if (r.contextValue == "folder")
                return 1;
        }
        return l.label.localeCompare(r.label);
    }
}
exports.JarNode = JarNode;
class JarTreeDataProvider {
    constructor() {
        this.onDidChangeTreeDataEmitter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
        this.jarRoots = [];
    }
    openJar(fileUri) {
        this.jarRoots = this.jarRoots.filter((jar) => jar.jarUri.path !== fileUri.path);
        this.jarRoots.push(new JarNode(fileUri));
        this.onDidChangeTreeDataEmitter.fire();
    }
    closeJar(targetJar) {
        this.jarRoots = this.jarRoots.filter((jar) => jar.jarUri.path !== targetJar.path);
        this.onDidChangeTreeDataEmitter.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        var _a;
        return (_a = element === null || element === void 0 ? void 0 : element.children) !== null && _a !== void 0 ? _a : this.jarRoots;
    }
    provideTextDocumentContent(uri, _token) {
        return new Promise((resolve, _reject) => {
            for (const jar of this.jarRoots) {
                if (uri.fsPath.startsWith(jar.jarUri.fsPath)) {
                    resolve(jar.getText(uri));
                }
            }
        });
    }
}
exports.JarTreeDataProvider = JarTreeDataProvider;
//# sourceMappingURL=JarTreeDataProvider.js.map