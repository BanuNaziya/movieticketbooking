"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const AdmZip = require("adm-zip");
const path = require("path");
const shared = require("./shared");
const _ = {
    groupBy: require("lodash.groupby"),
};
class JarNode {
    constructor(sourceUri, parent = null, label = path.basename(sourceUri.fsPath), zip = new AdmZip(sourceUri.fsPath), nodes) {
        this.sourceUri = sourceUri;
        this.parent = parent;
        this.label = label;
        this.zip = zip;
        this.nodes = nodes !== null && nodes !== void 0 ? nodes : this.childNodesFromPaths(sourceUri, this.zip
            .getEntries()
            .sort((a, b) => a.entryName.localeCompare(b.entryName))
            .map((e) => e.entryName));
    }
    // public child(label: string, nodes: JarNode[]): JarNode {
    // 	return new JarNode(
    // 		this.sourceUri,
    // 		this.label + label, // parent
    // 		label,
    // 		this.zip,
    // 		nodes
    // 	);
    // }
    childNodesFromPaths(sourceUri, files, parent = "") {
        // Group by first path element
        var groups = _.groupBy(files, (file) => file.match(/^[^/]*\/?/));
        // console.log(groups);
        return Object.keys(groups).map((groupKey) => {
            const group = groups[groupKey];
            return new JarNode(sourceUri, parent, groupKey, this.zip, this.childNodesFromPaths(sourceUri, group
                // Remove parent directory from file paths
                .map((node) => node.substr(groupKey.length))
                // Skip the empty path
                .filter((node) => node), 
            // New parent..., normalize to one trailing slash
            parent + groupKey));
        });
    }
    getText(filePath) {
        return new Promise((resolve, reject) => {
            var _a;
            try {
                (_a = this.zip) === null || _a === void 0 ? void 0 : _a.readAsTextAsync(filePath, resolve);
            }
            catch (error) {
                reject(error.toString());
            }
        });
    }
    get iconPath() {
        if (this.parent === null)
            return new vscode_1.ThemeIcon("file-zip");
        else if (this.label.endsWith("/"))
            return new vscode_1.ThemeIcon("folder");
        else
            return new vscode_1.ThemeIcon("file");
    }
    get contextValue() {
        if (this.parent === null)
            return "jar";
        else if (this.label.endsWith("/"))
            return "folder";
        else if (this.label.endsWith(".class"))
            return "class";
        else
            return "file";
    }
    get collapsibleState() {
        switch (this.contextValue) {
            case "folder":
            case "jar":
                return vscode_1.TreeItemCollapsibleState.Collapsed;
            default:
                return vscode_1.TreeItemCollapsibleState.None;
        }
    }
    get command() {
        const open = (scheme, ...paths) => ({
            command: "vscode.open",
            arguments: [this.sourceUri.with({ scheme, path: path.posix.join(...paths) })],
            title: "Open JAR Resource",
        });
        switch (this.contextValue) {
            case "file":
                return open("file", this.sourceUri.path, this.parent, this.label);
            case "class":
                const verbose = vscode_1.workspace.getConfiguration("jvm-bytecode-viewer").get("defaultToVerboseOutput");
                return open("javap", this.sourceUri.path + "!", this.parent, shared.bytecodeFile(this.label, { verbose }));
            default:
                return undefined;
        }
    }
}
exports.JarNode = JarNode;
class JarTreeDataProvider {
    constructor() {
        this.onDidChangeTreeDataEmitter = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
        this.clear();
        this.jarRoots = [];
    }
    openJar(fileUri) {
        this.jarRoots.push(new JarNode(fileUri));
        this.onDidChangeTreeDataEmitter.fire();
    }
    clear() {
        this.jarRoots = [];
        this.onDidChangeTreeDataEmitter.fire();
    }
    getTreeItem(element) {
        return {
            label: element.label,
            iconPath: element.iconPath,
            contextValue: element.contextValue,
            command: element.command,
            collapsibleState: element.collapsibleState,
        };
    }
    getChildren(element) {
        var _a;
        return (_a = element === null || element === void 0 ? void 0 : element.nodes) !== null && _a !== void 0 ? _a : this.jarRoots;
    }
    provideTextDocumentContent(uri, _token) {
        return new Promise((resolve, _reject) => {
            this.jarRoots.forEach((zip) => {
                if (uri.fsPath.startsWith(zip.sourceUri.fsPath)) {
                    const filePath = uri.path.substr(zip.sourceUri.path.length + 1);
                    resolve(zip.getText(filePath));
                }
            });
        });
    }
}
exports.default = JarTreeDataProvider;
//# sourceMappingURL=JarExplorer.js.map