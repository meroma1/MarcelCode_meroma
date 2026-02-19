/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/auth/auth-provider.ts"
/*!***********************************!*\
  !*** ./src/auth/auth-provider.ts ***!
  \***********************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthProvider = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const MICROSOFT_PROVIDER_ID = 'microsoft';
const SCOPES = ['openid', 'profile', 'email', 'offline_access'];
class AuthProvider {
    session;
    isInitialized = false;
    onDidChangeEmitter = new vscode.EventEmitter();
    onDidChange = this.onDidChangeEmitter.event;
    async initializeSession() {
        if (this.isInitialized) {
            return;
        }
        try {
            this.session = await vscode.authentication.getSession(MICROSOFT_PROVIDER_ID, SCOPES, {
                createIfNone: false,
            });
            this.isInitialized = true;
            if (this.session) {
                this.onDidChangeEmitter.fire();
            }
        }
        catch {
            this.isInitialized = true;
        }
    }
    async signIn() {
        try {
            this.session = await vscode.authentication.getSession(MICROSOFT_PROVIDER_ID, SCOPES, {
                createIfNone: true,
            });
            this.isInitialized = true;
            this.onDidChangeEmitter.fire();
            vscode.window.showInformationMessage(`Marcel'IA: Connecté en tant que ${this.session.account.label}`);
            return this.session;
        }
        catch (err) {
            vscode.window.showErrorMessage(`Marcel'IA: Échec de la connexion - ${err}`);
            return undefined;
        }
    }
    async signOut() {
        this.session = undefined;
        this.onDidChangeEmitter.fire();
        vscode.window.showInformationMessage("Marcel'IA: Déconnecté");
    }
    async getSession() {
        // Ensure initialization has happened
        if (!this.isInitialized) {
            await this.initializeSession();
        }
        if (this.session) {
            return this.session;
        }
        // Try silent auth again if not yet initialized
        try {
            this.session = await vscode.authentication.getSession(MICROSOFT_PROVIDER_ID, SCOPES, {
                createIfNone: false,
            });
            return this.session;
        }
        catch {
            return undefined;
        }
    }
    async ensureAuthenticated() {
        // Ensure initialization has happened
        if (!this.isInitialized) {
            await this.initializeSession();
        }
        // If we have a session, we're authenticated
        if (this.session) {
            return true;
        }
        // Try interactive login only if we don't have a session
        console.log("Marcel'IA: session non restaurée, tentative de connexion interactive");
        const session = await this.signIn();
        return session !== undefined;
    }
    async getAccessToken() {
        const session = await this.getSession();
        return session?.accessToken;
    }
    isSignedIn() {
        return this.session !== undefined;
    }
    getAccountName() {
        return this.session?.account.label;
    }
}
exports.AuthProvider = AuthProvider;


/***/ },

/***/ "./src/commands/index.ts"
/*!*******************************!*\
  !*** ./src/commands/index.ts ***!
  \*******************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerCommands = registerCommands;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const context_collector_1 = __webpack_require__(/*! ../services/context-collector */ "./src/services/context-collector.ts");
function registerCommands(context, authProvider, apiClient, chatViewProvider) {
    // Sign in
    context.subscriptions.push(vscode.commands.registerCommand('marcelia.signIn', () => authProvider.signIn()));
    // Sign out
    context.subscriptions.push(vscode.commands.registerCommand('marcelia.signOut', () => authProvider.signOut()));
    // Open chat
    context.subscriptions.push(vscode.commands.registerCommand('marcelia.chat', () => {
        vscode.commands.executeCommand('marcelia.chatView.focus');
    }));
    // Review code
    context.subscriptions.push(vscode.commands.registerCommand('marcelia.reviewCode', async () => {
        const codeInfo = (0, context_collector_1.getSelectedCodeOrCurrentFile)();
        if (!codeInfo) {
            vscode.window.showWarningMessage("Marcel'IA: Aucun code sélectionné");
            return;
        }
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: "Marcel'IA: Revue du code en cours..." }, async () => {
            try {
                const result = await apiClient.post('/review', {
                    code: codeInfo.code,
                    language: codeInfo.language,
                    filePath: codeInfo.filePath,
                    reviewType: 'full',
                });
                const doc = await vscode.workspace.openTextDocument({
                    content: `# Revue de Code - ${codeInfo.filePath}\n\n${result.review}`,
                    language: 'markdown',
                });
                await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });
            }
            catch (err) {
                vscode.window.showErrorMessage(`Marcel'IA: ${err}`);
            }
        });
    }));
    // Explain code
    context.subscriptions.push(vscode.commands.registerCommand('marcelia.explainCode', async () => {
        const codeInfo = (0, context_collector_1.getSelectedCodeOrCurrentFile)();
        if (!codeInfo) {
            vscode.window.showWarningMessage("Marcel'IA: Aucun code sélectionné");
            return;
        }
        chatViewProvider.sendMessageToChat(`/explain\n\`\`\`${codeInfo.language}\n${codeInfo.code}\n\`\`\``);
        vscode.commands.executeCommand('marcelia.chatView.focus');
    }));
    // Generate tests
    context.subscriptions.push(vscode.commands.registerCommand('marcelia.generateTests', async () => {
        const codeInfo = (0, context_collector_1.getSelectedCodeOrCurrentFile)();
        if (!codeInfo) {
            vscode.window.showWarningMessage("Marcel'IA: Aucun code sélectionné");
            return;
        }
        chatViewProvider.sendMessageToChat(`/test\n\`\`\`${codeInfo.language}\n${codeInfo.code}\n\`\`\``);
        vscode.commands.executeCommand('marcelia.chatView.focus');
    }));
    // Generate docs
    context.subscriptions.push(vscode.commands.registerCommand('marcelia.generateDocs', async () => {
        const codeInfo = (0, context_collector_1.getSelectedCodeOrCurrentFile)();
        if (!codeInfo) {
            vscode.window.showWarningMessage("Marcel'IA: Aucun code sélectionné");
            return;
        }
        chatViewProvider.sendMessageToChat(`/doc\n\`\`\`${codeInfo.language}\n${codeInfo.code}\n\`\`\``);
        vscode.commands.executeCommand('marcelia.chatView.focus');
    }));
}


/***/ },

/***/ "./src/extension.ts"
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const auth_provider_1 = __webpack_require__(/*! ./auth/auth-provider */ "./src/auth/auth-provider.ts");
const api_client_1 = __webpack_require__(/*! ./services/api-client */ "./src/services/api-client.ts");
const chat_view_provider_1 = __webpack_require__(/*! ./views/chat/chat-view-provider */ "./src/views/chat/chat-view-provider.ts");
const completion_provider_1 = __webpack_require__(/*! ./providers/completion-provider */ "./src/providers/completion-provider.ts");
const code_action_provider_1 = __webpack_require__(/*! ./providers/code-action-provider */ "./src/providers/code-action-provider.ts");
const commands_1 = __webpack_require__(/*! ./commands */ "./src/commands/index.ts");
const plugin_1 = __webpack_require__(/*! ./plugin */ "./src/plugin/index.ts");
let authProvider;
let apiClient;
let pluginRegistry;
function activate(context) {
    // Initialize auth & API client
    authProvider = new auth_provider_1.AuthProvider();
    apiClient = new api_client_1.ApiClient(authProvider);
    pluginRegistry = new plugin_1.PluginRegistry();
    // Register chat webview
    const chatViewProvider = new chat_view_provider_1.ChatViewProvider(context.extensionUri, apiClient, authProvider, pluginRegistry);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('marcelia.chatView', chatViewProvider));
    // Register inline completion provider
    const completionEnabled = vscode.workspace
        .getConfiguration('marcelia')
        .get('completionEnabled', true);
    if (completionEnabled) {
        const completionProvider = new completion_provider_1.MarceliaCompletionProvider(apiClient);
        context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, completionProvider));
    }
    // Register code action provider
    const codeActionProvider = new code_action_provider_1.MarceliaCodeActionProvider();
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('*', codeActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
    }));
    // Register commands
    (0, commands_1.registerCommands)(context, authProvider, apiClient, chatViewProvider);
    // Initialize session on extension activation (skip in devMode)
    const devMode = vscode.workspace.getConfiguration('marcelia').get('devMode', false);
    if (devMode) {
        vscode.window.showInformationMessage("Marcel'IA: Mode développement activé (proxy local)");
    }
    else {
        authProvider.initializeSession().catch(() => {
            // Silent auth failed, user can sign in manually when opening chat
        });
    }
    // Status bar
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = "$(hubot) Marcel'IA";
    statusBar.command = 'marcelia.chat';
    statusBar.tooltip = "Ouvrir le chat Marcel'IA";
    statusBar.show();
    context.subscriptions.push(statusBar);
    console.log("Marcel'IA extension activated");
    return pluginRegistry.getPublicAPI();
}
function deactivate() {
    if (pluginRegistry) {
        pluginRegistry.dispose();
    }
    console.log("Marcel'IA extension deactivated");
}


/***/ },

/***/ "./src/plugin/index.ts"
/*!*****************************!*\
  !*** ./src/plugin/index.ts ***!
  \*****************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessagePipeline = exports.PromptTransformerPipeline = exports.SlashCommandRegistry = exports.ToolRegistry = exports.PluginRegistry = void 0;
var plugin_registry_1 = __webpack_require__(/*! ./plugin-registry */ "./src/plugin/plugin-registry.ts");
Object.defineProperty(exports, "PluginRegistry", ({ enumerable: true, get: function () { return plugin_registry_1.PluginRegistry; } }));
var tool_registry_1 = __webpack_require__(/*! ./tool-registry */ "./src/plugin/tool-registry.ts");
Object.defineProperty(exports, "ToolRegistry", ({ enumerable: true, get: function () { return tool_registry_1.ToolRegistry; } }));
var slash_command_registry_1 = __webpack_require__(/*! ./slash-command-registry */ "./src/plugin/slash-command-registry.ts");
Object.defineProperty(exports, "SlashCommandRegistry", ({ enumerable: true, get: function () { return slash_command_registry_1.SlashCommandRegistry; } }));
var prompt_transformer_pipeline_1 = __webpack_require__(/*! ./prompt-transformer-pipeline */ "./src/plugin/prompt-transformer-pipeline.ts");
Object.defineProperty(exports, "PromptTransformerPipeline", ({ enumerable: true, get: function () { return prompt_transformer_pipeline_1.PromptTransformerPipeline; } }));
var message_pipeline_1 = __webpack_require__(/*! ./message-pipeline */ "./src/plugin/message-pipeline.ts");
Object.defineProperty(exports, "MessagePipeline", ({ enumerable: true, get: function () { return message_pipeline_1.MessagePipeline; } }));


/***/ },

/***/ "./src/plugin/message-pipeline.ts"
/*!****************************************!*\
  !*** ./src/plugin/message-pipeline.ts ***!
  \****************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessagePipeline = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const DEFAULT_PRIORITY = 100;
class MessagePipeline {
    preprocessors = [];
    postprocessors = [];
    registerPreprocessor(fn, priority = DEFAULT_PRIORITY) {
        const entry = { fn, priority };
        this.preprocessors.push(entry);
        this.preprocessors.sort((a, b) => a.priority - b.priority);
        return new vscode.Disposable(() => {
            const idx = this.preprocessors.indexOf(entry);
            if (idx >= 0) {
                this.preprocessors.splice(idx, 1);
            }
        });
    }
    registerPostprocessor(fn, priority = DEFAULT_PRIORITY) {
        const entry = { fn, priority };
        this.postprocessors.push(entry);
        this.postprocessors.sort((a, b) => a.priority - b.priority);
        return new vscode.Disposable(() => {
            const idx = this.postprocessors.indexOf(entry);
            if (idx >= 0) {
                this.postprocessors.splice(idx, 1);
            }
        });
    }
    preprocess(message) {
        let result = message;
        for (const { fn } of this.preprocessors) {
            result = fn(result);
        }
        return result;
    }
    postprocess(response) {
        let result = response;
        for (const { fn } of this.postprocessors) {
            result = fn(result);
        }
        return result;
    }
    dispose() {
        this.preprocessors = [];
        this.postprocessors = [];
    }
}
exports.MessagePipeline = MessagePipeline;


/***/ },

/***/ "./src/plugin/plugin-registry.ts"
/*!***************************************!*\
  !*** ./src/plugin/plugin-registry.ts ***!
  \***************************************/
(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PluginRegistry = void 0;
const tool_registry_1 = __webpack_require__(/*! ./tool-registry */ "./src/plugin/tool-registry.ts");
const slash_command_registry_1 = __webpack_require__(/*! ./slash-command-registry */ "./src/plugin/slash-command-registry.ts");
const prompt_transformer_pipeline_1 = __webpack_require__(/*! ./prompt-transformer-pipeline */ "./src/plugin/prompt-transformer-pipeline.ts");
const message_pipeline_1 = __webpack_require__(/*! ./message-pipeline */ "./src/plugin/message-pipeline.ts");
class PluginRegistry {
    tools = new tool_registry_1.ToolRegistry();
    slashCommands = new slash_command_registry_1.SlashCommandRegistry();
    promptTransformers = new prompt_transformer_pipeline_1.PromptTransformerPipeline();
    messagePipeline = new message_pipeline_1.MessagePipeline();
    getPublicAPI() {
        return {
            tools: {
                register: (tool) => this.tools.register(tool),
            },
            slashCommands: {
                register: (command) => this.slashCommands.register(command),
            },
            promptTransformers: {
                register: (transformer, priority) => this.promptTransformers.register(transformer, priority),
            },
            messagePipeline: {
                registerPreprocessor: (fn, priority) => this.messagePipeline.registerPreprocessor(fn, priority),
                registerPostprocessor: (fn, priority) => this.messagePipeline.registerPostprocessor(fn, priority),
            },
        };
    }
    dispose() {
        this.tools.dispose();
        this.slashCommands.dispose();
        this.promptTransformers.dispose();
        this.messagePipeline.dispose();
    }
}
exports.PluginRegistry = PluginRegistry;


/***/ },

/***/ "./src/plugin/prompt-transformer-pipeline.ts"
/*!***************************************************!*\
  !*** ./src/plugin/prompt-transformer-pipeline.ts ***!
  \***************************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PromptTransformerPipeline = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const DEFAULT_PRIORITY = 100;
class PromptTransformerPipeline {
    transformers = [];
    register(transformer, priority = DEFAULT_PRIORITY) {
        const entry = { transformer, priority };
        this.transformers.push(entry);
        this.transformers.sort((a, b) => a.priority - b.priority);
        return new vscode.Disposable(() => {
            const idx = this.transformers.indexOf(entry);
            if (idx >= 0) {
                this.transformers.splice(idx, 1);
            }
        });
    }
    transform(prompt, context) {
        let result = prompt;
        for (const { transformer } of this.transformers) {
            result = transformer(result, context);
        }
        return result;
    }
    dispose() {
        this.transformers = [];
    }
}
exports.PromptTransformerPipeline = PromptTransformerPipeline;


/***/ },

/***/ "./src/plugin/slash-command-registry.ts"
/*!**********************************************!*\
  !*** ./src/plugin/slash-command-registry.ts ***!
  \**********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SlashCommandRegistry = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
class SlashCommandRegistry {
    commands = new Map();
    register(command) {
        const trigger = command.trigger;
        if (this.commands.has(trigger)) {
            throw new Error(`Slash command "${trigger}" is already registered`);
        }
        this.commands.set(trigger, command);
        return new vscode.Disposable(() => {
            this.unregister(trigger);
        });
    }
    unregister(trigger) {
        this.commands.delete(trigger);
    }
    getAll() {
        return new Map(this.commands);
    }
    execute(trigger, args) {
        const command = this.commands.get(trigger);
        if (!command) {
            return null;
        }
        return command.handler(args);
    }
    has(trigger) {
        return this.commands.has(trigger);
    }
    dispose() {
        this.commands.clear();
    }
}
exports.SlashCommandRegistry = SlashCommandRegistry;


/***/ },

/***/ "./src/plugin/tool-registry.ts"
/*!*************************************!*\
  !*** ./src/plugin/tool-registry.ts ***!
  \*************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ToolRegistry = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const BUILT_IN_TOOLS = new Set([
    'read_file',
    'write_file',
    'edit_file',
    'create_directory',
    'list_files',
]);
class ToolRegistry {
    tools = new Map();
    register(tool) {
        const name = tool.schema.name;
        if (BUILT_IN_TOOLS.has(name)) {
            throw new Error(`Cannot register tool "${name}": name is reserved for built-in tools`);
        }
        if (this.tools.has(name)) {
            throw new Error(`Tool "${name}" is already registered`);
        }
        this.tools.set(name, tool);
        return new vscode.Disposable(() => {
            this.unregister(name);
        });
    }
    unregister(toolName) {
        this.tools.delete(toolName);
    }
    getSchemas() {
        return Array.from(this.tools.values()).map((t) => t.schema);
    }
    async execute(name, input) {
        const tool = this.tools.get(name);
        if (!tool) {
            return { content: `Unknown plugin tool: ${name}`, isError: true };
        }
        try {
            return await tool.handler(input);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Plugin tool execution error';
            return { content: `Error: ${msg}`, isError: true };
        }
    }
    has(name) {
        return this.tools.has(name);
    }
    dispose() {
        this.tools.clear();
    }
}
exports.ToolRegistry = ToolRegistry;


/***/ },

/***/ "./src/providers/code-action-provider.ts"
/*!***********************************************!*\
  !*** ./src/providers/code-action-provider.ts ***!
  \***********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarceliaCodeActionProvider = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
class MarceliaCodeActionProvider {
    provideCodeActions(document, range) {
        if (range.isEmpty)
            return undefined;
        const actions = [];
        const reviewAction = new vscode.CodeAction("Marcel'IA: Review Code", vscode.CodeActionKind.QuickFix);
        reviewAction.command = {
            command: 'marcelia.reviewCode',
            title: 'Review Code',
        };
        actions.push(reviewAction);
        const explainAction = new vscode.CodeAction("Marcel'IA: Explain Code", vscode.CodeActionKind.QuickFix);
        explainAction.command = {
            command: 'marcelia.explainCode',
            title: 'Explain Code',
        };
        actions.push(explainAction);
        const testAction = new vscode.CodeAction("Marcel'IA: Generate Tests", vscode.CodeActionKind.QuickFix);
        testAction.command = {
            command: 'marcelia.generateTests',
            title: 'Generate Tests',
        };
        actions.push(testAction);
        return actions;
    }
}
exports.MarceliaCodeActionProvider = MarceliaCodeActionProvider;


/***/ },

/***/ "./src/providers/completion-provider.ts"
/*!**********************************************!*\
  !*** ./src/providers/completion-provider.ts ***!
  \**********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MarceliaCompletionProvider = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
class MarceliaCompletionProvider {
    apiClient;
    debounceTimer;
    lastRequestAbort;
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    async provideInlineCompletionItems(document, position, _context, token) {
        // Clear previous debounce
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        if (this.lastRequestAbort) {
            this.lastRequestAbort.abort();
        }
        const debounceMs = vscode.workspace
            .getConfiguration('marcelia')
            .get('completionDebounceMs', 300);
        return new Promise((resolve) => {
            this.debounceTimer = setTimeout(async () => {
                if (token.isCancellationRequested) {
                    resolve(undefined);
                    return;
                }
                try {
                    const prefixRange = new vscode.Range(new vscode.Position(Math.max(0, position.line - 50), 0), position);
                    const suffixRange = new vscode.Range(position, new vscode.Position(Math.min(document.lineCount - 1, position.line + 20), 0));
                    const prefix = document.getText(prefixRange);
                    const suffix = document.getText(suffixRange);
                    // Skip if line is empty or too short
                    const currentLine = document.lineAt(position.line).text;
                    if (currentLine.trim().length < 2) {
                        resolve(undefined);
                        return;
                    }
                    const response = await this.apiClient.post('/completion', {
                        prompt: currentLine,
                        prefix,
                        suffix,
                        language: document.languageId,
                        filePath: vscode.workspace.asRelativePath(document.uri),
                        maxTokens: 256,
                    });
                    if (token.isCancellationRequested || !response.completion) {
                        resolve(undefined);
                        return;
                    }
                    const item = new vscode.InlineCompletionItem(response.completion, new vscode.Range(position, position));
                    resolve([item]);
                }
                catch {
                    resolve(undefined);
                }
            }, debounceMs);
        });
    }
}
exports.MarceliaCompletionProvider = MarceliaCompletionProvider;


/***/ },

/***/ "./src/services/api-client.ts"
/*!************************************!*\
  !*** ./src/services/api-client.ts ***!
  \************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiClient = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
class ApiClient {
    authProvider;
    baseUrl;
    headerMiddleware = [];
    constructor(authProvider) {
        this.authProvider = authProvider;
        this.baseUrl = vscode.workspace.getConfiguration('marcelia').get('proxyUrl', 'http://localhost:3000');
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('marcelia.proxyUrl')) {
                this.baseUrl = vscode.workspace.getConfiguration('marcelia').get('proxyUrl', 'http://localhost:3000');
            }
        });
    }
    addHeaderMiddleware(fn) {
        this.headerMiddleware.push(fn);
    }
    async getHeaders() {
        const devMode = vscode.workspace.getConfiguration('marcelia').get('devMode', false);
        let headers;
        if (devMode) {
            headers = { 'Content-Type': 'application/json' };
        }
        else {
            const token = await this.authProvider.getAccessToken();
            if (!token) {
                throw new Error('Authentification requise. Veuillez vous connecter avec votre compte ERANOVE.');
            }
            headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            };
        }
        // Apply header middleware from plugins (protect critical headers)
        const protectedContentType = headers['Content-Type'];
        const protectedAuth = headers['Authorization'];
        for (const middleware of this.headerMiddleware) {
            headers = await middleware(headers);
        }
        headers['Content-Type'] = protectedContentType;
        if (protectedAuth) {
            headers['Authorization'] = protectedAuth;
        }
        return headers;
    }
    async post(path, body) {
        const headers = await this.getHeaders();
        const url = `${this.baseUrl}/api/v1${path}`;
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(`API error ${response.status}: ${error.error || response.statusText}`);
        }
        return response.json();
    }
    async postStream(path, body) {
        const headers = await this.getHeaders();
        const url = `${this.baseUrl}/api/v1${path}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...headers,
                Accept: 'text/event-stream',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(`API error ${response.status}: ${error.error || response.statusText}`);
        }
        if (!response.body) {
            throw new Error('No response body for streaming');
        }
        return response.body;
    }
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
exports.ApiClient = ApiClient;


/***/ },

/***/ "./src/services/context-collector.ts"
/*!*******************************************!*\
  !*** ./src/services/context-collector.ts ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collectContext = collectContext;
exports.getSelectedCodeOrCurrentFile = getSelectedCodeOrCurrentFile;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
function collectContext() {
    const editor = vscode.window.activeTextEditor;
    const openFiles = vscode.window.tabGroups.all
        .flatMap((group) => group.tabs)
        .map((tab) => {
        const input = tab.input;
        if (input && typeof input === 'object' && 'uri' in input) {
            return input.uri.fsPath;
        }
        return undefined;
    })
        .filter((f) => f !== undefined);
    const workspaceLanguages = [...new Set(openFiles.map((f) => {
            const ext = f.split('.').pop()?.toLowerCase();
            const langMap = {
                ts: 'typescript', tsx: 'typescriptreact', js: 'javascript', jsx: 'javascriptreact',
                py: 'python', java: 'java', go: 'go', rs: 'rust', rb: 'ruby', cs: 'csharp',
                cpp: 'cpp', c: 'c', php: 'php', swift: 'swift', kt: 'kotlin',
            };
            return ext ? langMap[ext] || ext : undefined;
        }).filter((l) => l !== undefined))];
    return {
        currentFile: editor?.document.uri.fsPath,
        currentLanguage: editor?.document.languageId,
        selection: editor?.selection.isEmpty
            ? undefined
            : editor?.document.getText(editor.selection),
        cursorLine: editor?.selection.active.line,
        openFiles,
        workspaceLanguages,
    };
}
function getSelectedCodeOrCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return undefined;
    const selection = editor.selection;
    const code = selection.isEmpty
        ? editor.document.getText()
        : editor.document.getText(selection);
    return {
        code,
        language: editor.document.languageId,
        filePath: vscode.workspace.asRelativePath(editor.document.uri),
    };
}


/***/ },

/***/ "./src/services/json-content-extractor.ts"
/*!************************************************!*\
  !*** ./src/services/json-content-extractor.ts ***!
  \************************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JsonContentExtractor = void 0;
/**
 * State machine that processes partial JSON fragments character by character
 * and extracts string values for specific keys as they stream in.
 *
 * Used to extract `path` and `content` from write_file tool input
 * as it arrives via input_json_delta SSE events.
 */
class JsonContentExtractor {
    state = 0 /* State.SCANNING */;
    currentKey = '';
    currentValue = '';
    escapeBuffer = '';
    isWatchedKey = false;
    watchKeys;
    streamKey;
    onEvent;
    skipEscape = false;
    constructor(options) {
        this.watchKeys = new Set(options.watchKeys);
        this.streamKey = options.streamKey;
        this.onEvent = options.onEvent;
    }
    feed(fragment) {
        for (let i = 0; i < fragment.length; i++) {
            this.processChar(fragment[i]);
        }
    }
    processChar(ch) {
        switch (this.state) {
            case 0 /* State.SCANNING */:
                if (ch === '"') {
                    this.state = 1 /* State.IN_KEY */;
                    this.currentKey = '';
                }
                break;
            case 1 /* State.IN_KEY */:
                if (ch === '"') {
                    this.state = 2 /* State.AFTER_KEY */;
                }
                else {
                    this.currentKey += ch;
                }
                break;
            case 2 /* State.AFTER_KEY */:
                if (ch === ':') {
                    this.state = 3 /* State.AFTER_COLON */;
                    this.isWatchedKey = this.watchKeys.has(this.currentKey);
                }
                else if (ch === ',' || ch === '}') {
                    // This was a value, not a key — reset
                    this.state = 0 /* State.SCANNING */;
                }
                break;
            case 3 /* State.AFTER_COLON */:
                if (ch === '"') {
                    if (this.isWatchedKey) {
                        this.state = 4 /* State.IN_STRING_VALUE */;
                        this.currentValue = '';
                        this.escapeBuffer = '';
                    }
                    else {
                        this.state = 5 /* State.SKIP_STRING */;
                        this.skipEscape = false;
                    }
                }
                else if (ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r') {
                    // Non-string value — skip back to scanning
                    this.state = 0 /* State.SCANNING */;
                }
                break;
            case 4 /* State.IN_STRING_VALUE */:
                this.processStringChar(ch);
                break;
            case 5 /* State.SKIP_STRING */:
                if (this.skipEscape) {
                    this.skipEscape = false;
                }
                else if (ch === '\\') {
                    this.skipEscape = true;
                }
                else if (ch === '"') {
                    this.state = 0 /* State.SCANNING */;
                }
                break;
        }
    }
    processStringChar(ch) {
        // Handle escape continuation from previous character
        if (this.escapeBuffer === '\\') {
            this.escapeBuffer = '';
            if (ch === 'u') {
                this.escapeBuffer = '\\u';
                return;
            }
            const decoded = this.decodeEscapeChar(ch);
            this.emitContent(decoded);
            return;
        }
        // Handle \uXXXX unicode escape
        if (this.escapeBuffer.startsWith('\\u')) {
            this.escapeBuffer += ch;
            if (this.escapeBuffer.length === 6) {
                const codePoint = parseInt(this.escapeBuffer.slice(2), 16);
                this.emitContent(isNaN(codePoint) ? '' : String.fromCharCode(codePoint));
                this.escapeBuffer = '';
            }
            return;
        }
        if (ch === '\\') {
            this.escapeBuffer = '\\';
            return;
        }
        if (ch === '"') {
            // String ended
            if (this.currentKey === this.streamKey) {
                this.onEvent({ type: 'content_done' });
            }
            else {
                this.onEvent({ type: 'key_value', key: this.currentKey, value: this.currentValue });
            }
            this.state = 0 /* State.SCANNING */;
            return;
        }
        this.emitContent(ch);
    }
    emitContent(decoded) {
        if (this.currentKey === this.streamKey) {
            this.onEvent({ type: 'content_chunk', value: decoded });
        }
        else {
            this.currentValue += decoded;
        }
    }
    decodeEscapeChar(ch) {
        switch (ch) {
            case 'n': return '\n';
            case 't': return '\t';
            case 'r': return '\r';
            case '"': return '"';
            case '\\': return '\\';
            case '/': return '/';
            case 'b': return '\b';
            case 'f': return '\f';
            default: return ch;
        }
    }
    reset() {
        this.state = 0 /* State.SCANNING */;
        this.currentKey = '';
        this.currentValue = '';
        this.escapeBuffer = '';
        this.isWatchedKey = false;
    }
}
exports.JsonContentExtractor = JsonContentExtractor;


/***/ },

/***/ "./src/services/streaming-client.ts"
/*!******************************************!*\
  !*** ./src/services/streaming-client.ts ***!
  \******************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseSSEStream = parseSSEStream;
async function parseSSEStream(stream, callbacks) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    // Track tool_use blocks being built
    let currentToolId = '';
    let currentToolName = '';
    let jsonAccumulator = '';
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.startsWith('event: done')) {
                    callbacks.onDone();
                    return;
                }
                if (line.startsWith('event: error')) {
                    continue;
                }
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        callbacks.onDone();
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        // Text content
                        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                            callbacks.onText(parsed.delta.text);
                        }
                        // Tool use block start — capture id and name
                        if (parsed.type === 'content_block_start' && parsed.content_block?.type === 'tool_use') {
                            currentToolId = parsed.content_block.id;
                            currentToolName = parsed.content_block.name;
                            jsonAccumulator = '';
                            callbacks.onToolStart?.(currentToolId, currentToolName);
                        }
                        // Tool use JSON input streaming
                        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'input_json_delta') {
                            jsonAccumulator += parsed.delta.partial_json;
                            callbacks.onToolInputDelta?.(currentToolId, currentToolName, parsed.delta.partial_json);
                        }
                        // Tool use block done — emit the complete tool call
                        if (parsed.type === 'content_block_stop' && currentToolId) {
                            let toolInput = {};
                            try {
                                toolInput = JSON.parse(jsonAccumulator);
                            }
                            catch {
                                toolInput = { raw: jsonAccumulator };
                            }
                            callbacks.onToolUse({
                                id: currentToolId,
                                name: currentToolName,
                                input: toolInput,
                            });
                            currentToolId = '';
                            currentToolName = '';
                            jsonAccumulator = '';
                        }
                        // Stop reason (end_turn or tool_use)
                        if (parsed.type === 'message_delta' && parsed.delta?.stop_reason) {
                            callbacks.onStopReason(parsed.delta.stop_reason);
                        }
                        // Error events
                        if (parsed.error) {
                            callbacks.onError(parsed.error);
                            return;
                        }
                    }
                    catch {
                        // Skip unparseable lines
                    }
                }
            }
        }
        callbacks.onDone();
    }
    catch (err) {
        callbacks.onError(err instanceof Error ? err.message : 'Stream error');
    }
    finally {
        reader.releaseLock();
    }
}


/***/ },

/***/ "./src/services/streaming-editor.ts"
/*!******************************************!*\
  !*** ./src/services/streaming-editor.ts ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StreamingEditorManager = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
/**
 * Manages progressive writing of content into a VS Code editor document.
 * Opens a file, appends content as it streams, and saves when done.
 *
 * Content chunks can arrive BEFORE the editor is open (due to async timing).
 * They are buffered internally and flushed once the editor is ready.
 */
class StreamingEditorManager {
    activeDoc = null;
    activeEditor = null;
    pendingContent = '';
    flushTimer = null;
    isFlushing = false;
    activePath = '';
    editorReady = false;
    /**
     * Create/open a file and prepare for progressive content writing.
     * Any content chunks received before this completes are buffered and flushed.
     */
    async openForStreaming(rootFolder, relativePath) {
        // Finalize any previous streaming session
        await this.finalize();
        this.activePath = relativePath;
        this.editorReady = false;
        const uri = vscode.Uri.joinPath(rootFolder.uri, relativePath);
        try {
            // Ensure parent directories exist
            const parentPath = relativePath.split('/').slice(0, -1).join('/');
            if (parentPath) {
                const parentUri = vscode.Uri.joinPath(rootFolder.uri, parentPath);
                await vscode.workspace.fs.createDirectory(parentUri);
            }
            // Create an empty file
            await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(''));
            // Open in editor beside the chat
            this.activeDoc = await vscode.workspace.openTextDocument(uri);
            this.activeEditor = await vscode.window.showTextDocument(this.activeDoc, {
                preview: false,
                preserveFocus: true,
                viewColumn: vscode.ViewColumn.Beside,
            });
            this.editorReady = true;
            // Flush any content that arrived while the editor was opening
            if (this.pendingContent) {
                await this.flush();
            }
            return true;
        }
        catch {
            this.activeDoc = null;
            this.activeEditor = null;
            this.activePath = '';
            this.editorReady = false;
            return false;
        }
    }
    /**
     * Append a chunk of content. Always buffers, even if editor isn't open yet.
     * Content is flushed to the editor in batches every 30ms once the editor is ready.
     */
    appendContent(chunk) {
        this.pendingContent += chunk;
        // Only schedule flush if editor is ready
        if (this.editorReady && !this.flushTimer) {
            this.flushTimer = setTimeout(() => {
                this.flushTimer = null;
                this.flush();
            }, 30);
        }
    }
    async flush() {
        if (!this.activeDoc || !this.pendingContent || this.isFlushing)
            return;
        this.isFlushing = true;
        const text = this.pendingContent;
        this.pendingContent = '';
        try {
            const edit = new vscode.WorkspaceEdit();
            const endPos = this.activeDoc.positionAt(this.activeDoc.getText().length);
            edit.insert(this.activeDoc.uri, endPos, text);
            await vscode.workspace.applyEdit(edit);
            // Auto-scroll to follow the writing
            if (this.activeEditor) {
                const lastLine = this.activeDoc.lineCount - 1;
                const lastChar = this.activeDoc.lineAt(lastLine).text.length;
                this.activeEditor.revealRange(new vscode.Range(lastLine, lastChar, lastLine, lastChar), vscode.TextEditorRevealType.InCenter);
            }
        }
        catch {
            // Editor may have been closed by user
        }
        this.isFlushing = false;
        // If more content arrived while flushing, flush again
        if (this.pendingContent && this.editorReady) {
            await this.flush();
        }
    }
    /**
     * Finalize the current file: flush remaining content and save.
     */
    async finalize() {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        // If editor isn't ready yet but we have content, we can't flush to editor.
        // Write directly to disk as fallback.
        if (!this.activeDoc && this.pendingContent && this.activePath) {
            // Content arrived but editor never opened — handled by executeTool fallback
            this.pendingContent = '';
            this.activePath = '';
            return;
        }
        if (!this.activeDoc)
            return;
        // Flush remaining content
        if (this.pendingContent) {
            await this.flush();
        }
        // Save the file
        try {
            if (!this.activeDoc.isUntitled) {
                await this.activeDoc.save();
            }
        }
        catch {
            // Ignore save errors
        }
        this.activeDoc = null;
        this.activeEditor = null;
        this.activePath = '';
        this.editorReady = false;
    }
    /**
     * Revert: cancel streaming and delete the file (used when user denies).
     */
    async revert(rootFolder, relativePath) {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        this.pendingContent = '';
        this.activeDoc = null;
        this.activeEditor = null;
        this.activePath = '';
        this.editorReady = false;
        try {
            const uri = vscode.Uri.joinPath(rootFolder.uri, relativePath);
            await vscode.workspace.fs.delete(uri);
        }
        catch {
            // File may not exist
        }
    }
    /** Whether a streaming session is currently active */
    get isActive() {
        return this.activePath !== '';
    }
    get currentPath() {
        return this.activePath;
    }
}
exports.StreamingEditorManager = StreamingEditorManager;


/***/ },

/***/ "./src/services/workspace-scanner.ts"
/*!*******************************************!*\
  !*** ./src/services/workspace-scanner.ts ***!
  \*******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkspaceScanner = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const MAX_FILE_LINES = 500;
const TRUNCATE_HEAD = 200;
const TRUNCATE_TAIL = 100;
const EXCLUDE_PATTERN = '{**/node_modules/**,**/.git/**,**/dist/**,**/build/**,**/out/**,**/.next/**,**/.nuxt/**,**/coverage/**,**/__pycache__/**,**/.venv/**,**/venv/**,**/*.min.js,**/*.min.css,**/*.map,**/*.lock,**/package-lock.json,**/yarn.lock,**/pnpm-lock.yaml,**/*.png,**/*.jpg,**/*.jpeg,**/*.gif,**/*.ico,**/*.svg,**/*.woff,**/*.woff2,**/*.ttf,**/*.eot,**/*.mp3,**/*.mp4,**/*.wav,**/*.pdf,**/*.zip,**/*.tar,**/*.gz,**/*.exe,**/*.dll,**/*.so,**/*.dylib,**/*.bin,**/*.dat,**/*.db,**/*.sqlite}';
const LANG_MAP = {
    ts: 'typescript', tsx: 'typescriptreact', js: 'javascript', jsx: 'javascriptreact',
    py: 'python', java: 'java', go: 'go', rs: 'rust', rb: 'ruby', cs: 'csharp',
    cpp: 'cpp', c: 'c', php: 'php', swift: 'swift', kt: 'kotlin',
    json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml', xml: 'xml',
    html: 'html', css: 'css', scss: 'scss', less: 'less',
    md: 'markdown', sh: 'shell', bash: 'shell', zsh: 'shell',
    sql: 'sql', graphql: 'graphql', proto: 'protobuf',
    dockerfile: 'dockerfile', makefile: 'makefile',
};
class WorkspaceScanner {
    treeCache = null;
    treeCacheValid = false;
    allPaths = [];
    disposables = [];
    constructor() {
        const watcher = vscode.workspace.onDidSaveTextDocument(() => {
            this.treeCacheValid = false;
        });
        const createWatcher = vscode.workspace.onDidCreateFiles(() => {
            this.treeCacheValid = false;
        });
        const deleteWatcher = vscode.workspace.onDidDeleteFiles(() => {
            this.treeCacheValid = false;
        });
        this.disposables.push(watcher, createWatcher, deleteWatcher);
    }
    getRootFolder() {
        return vscode.workspace.workspaceFolders?.[0];
    }
    async getFileTree() {
        const rootFolder = this.getRootFolder();
        if (!rootFolder)
            return null;
        if (this.treeCache && this.treeCacheValid) {
            return this.treeCache;
        }
        const uris = await vscode.workspace.findFiles('**/*', EXCLUDE_PATTERN, 1000);
        this.allPaths = uris.map(uri => vscode.workspace.asRelativePath(uri, false)).sort();
        const fileTree = this.buildFileTree(this.allPaths);
        this.treeCache = {
            rootName: rootFolder.name,
            fileTree,
            totalFiles: this.allPaths.length,
        };
        this.treeCacheValid = true;
        return this.treeCache;
    }
    async readFile(relativePath) {
        const rootFolder = this.getRootFolder();
        if (!rootFolder)
            return null;
        const uri = vscode.Uri.joinPath(rootFolder.uri, relativePath);
        try {
            const raw = await vscode.workspace.fs.readFile(uri);
            let content = new TextDecoder('utf-8').decode(raw);
            if (this.isBinaryContent(content))
                return null;
            const lines = content.split('\n');
            const lineCount = lines.length;
            if (lineCount > MAX_FILE_LINES) {
                const head = lines.slice(0, TRUNCATE_HEAD).join('\n');
                const tail = lines.slice(-TRUNCATE_TAIL).join('\n');
                content = `${head}\n\n[... ${lineCount - TRUNCATE_HEAD - TRUNCATE_TAIL} lines truncated ...]\n\n${tail}`;
            }
            return {
                path: relativePath,
                language: this.detectLanguage(relativePath),
                content,
                lines: lineCount,
            };
        }
        catch {
            return null;
        }
    }
    async writeFile(relativePath, content) {
        const rootFolder = this.getRootFolder();
        if (!rootFolder)
            return false;
        const uri = vscode.Uri.joinPath(rootFolder.uri, relativePath);
        try {
            // Auto-créer les dossiers parents si nécessaire
            const parentPath = relativePath.split('/').slice(0, -1).join('/');
            if (parentPath) {
                const parentUri = vscode.Uri.joinPath(rootFolder.uri, parentPath);
                await vscode.workspace.fs.createDirectory(parentUri);
            }
            await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
            this.treeCacheValid = false;
            return true;
        }
        catch {
            return false;
        }
    }
    async editFile(relativePath, oldText, newText) {
        const rootFolder = this.getRootFolder();
        if (!rootFolder)
            return false;
        const uri = vscode.Uri.joinPath(rootFolder.uri, relativePath);
        try {
            const raw = await vscode.workspace.fs.readFile(uri);
            const current = new TextDecoder('utf-8').decode(raw);
            if (!current.includes(oldText))
                return false;
            const updated = current.replace(oldText, newText);
            await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(updated));
            return true;
        }
        catch {
            return false;
        }
    }
    async createDirectory(relativePath) {
        const rootFolder = this.getRootFolder();
        if (!rootFolder)
            return false;
        const uri = vscode.Uri.joinPath(rootFolder.uri, relativePath);
        try {
            await vscode.workspace.fs.createDirectory(uri);
            this.treeCacheValid = false;
            return true;
        }
        catch {
            return false;
        }
    }
    async listFiles(relativePath, pattern) {
        const rootFolder = this.getRootFolder();
        if (!rootFolder)
            return [];
        const searchPattern = pattern
            ? (relativePath ? `${relativePath}/${pattern}` : pattern)
            : (relativePath ? `${relativePath}/**/*` : '**/*');
        const uris = await vscode.workspace.findFiles(searchPattern, EXCLUDE_PATTERN, 200);
        return uris.map(uri => vscode.workspace.asRelativePath(uri, false)).sort();
    }
    buildFileTree(paths) {
        const tree = {};
        for (const p of paths) {
            const parts = p.split('/');
            let current = tree;
            for (const part of parts) {
                if (!current[part])
                    current[part] = {};
                current = current[part];
            }
        }
        return this.renderTree(tree, '', true);
    }
    renderTree(node, prefix, isRoot) {
        const entries = Object.keys(node).sort((a, b) => {
            const aIsDir = Object.keys(node[a]).length > 0;
            const bIsDir = Object.keys(node[b]).length > 0;
            if (aIsDir && !bIsDir)
                return -1;
            if (!aIsDir && bIsDir)
                return 1;
            return a.localeCompare(b);
        });
        let result = '';
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const isLast = i === entries.length - 1;
            const connector = isRoot ? '' : (isLast ? '└── ' : '├── ');
            const childPrefix = isRoot ? '' : (isLast ? '    ' : '│   ');
            result += `${prefix}${connector}${entry}\n`;
            if (Object.keys(node[entry]).length > 0) {
                result += this.renderTree(node[entry], `${prefix}${childPrefix}`, false);
            }
        }
        return result;
    }
    detectLanguage(filePath) {
        const fileName = filePath.split('/').pop()?.toLowerCase() || '';
        if (fileName === 'dockerfile')
            return 'dockerfile';
        if (fileName === 'makefile')
            return 'makefile';
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (!ext)
            return 'text';
        return LANG_MAP[ext] || ext;
    }
    isBinaryContent(content) {
        const sample = content.slice(0, 512);
        let nullCount = 0;
        for (let i = 0; i < sample.length; i++) {
            if (sample.charCodeAt(i) === 0)
                nullCount++;
        }
        return nullCount > 4;
    }
    dispose() {
        for (const d of this.disposables)
            d.dispose();
    }
}
exports.WorkspaceScanner = WorkspaceScanner;


/***/ },

/***/ "./src/views/chat/chat-view-provider.ts"
/*!**********************************************!*\
  !*** ./src/views/chat/chat-view-provider.ts ***!
  \**********************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChatViewProvider = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const streaming_client_1 = __webpack_require__(/*! ../../services/streaming-client */ "./src/services/streaming-client.ts");
const context_collector_1 = __webpack_require__(/*! ../../services/context-collector */ "./src/services/context-collector.ts");
const workspace_scanner_1 = __webpack_require__(/*! ../../services/workspace-scanner */ "./src/services/workspace-scanner.ts");
const json_content_extractor_1 = __webpack_require__(/*! ../../services/json-content-extractor */ "./src/services/json-content-extractor.ts");
const streaming_editor_1 = __webpack_require__(/*! ../../services/streaming-editor */ "./src/services/streaming-editor.ts");
const MAX_TOOL_ROUNDS = 20;
const MAX_HISTORY_MESSAGES = 50;
const TOOL_RESULT_TRUNCATE_CHARS = 2000;
class ChatViewProvider {
    extensionUri;
    apiClient;
    authProvider;
    pluginRegistry;
    webviewView;
    history = [];
    workspaceScanner;
    streamingEditor;
    activeExtractors = new Map();
    pendingConfirmations = new Map();
    streamedToolPaths = new Map();
    constructor(extensionUri, apiClient, authProvider, pluginRegistry) {
        this.extensionUri = extensionUri;
        this.apiClient = apiClient;
        this.authProvider = authProvider;
        this.pluginRegistry = pluginRegistry;
        this.workspaceScanner = new workspace_scanner_1.WorkspaceScanner();
        this.streamingEditor = new streaming_editor_1.StreamingEditorManager();
        // Listen for auth state changes to show/hide login screen
        this.authProvider.onDidChange(() => {
            const isDevMode = vscode.workspace.getConfiguration('marcelia').get('devMode', false);
            if (isDevMode)
                return;
            if (this.authProvider.isSignedIn()) {
                this.postToWebview({ type: 'hideLoginScreen' });
            }
            else {
                this.postToWebview({ type: 'showLoginScreen' });
            }
        });
        // Register built-in slash commands
        this.pluginRegistry.slashCommands.register({
            trigger: '/test',
            description: 'Génère des tests unitaires pour ce code',
            handler: (args) => `Génère des tests unitaires pour ce code :\n${args}`,
        });
        this.pluginRegistry.slashCommands.register({
            trigger: '/doc',
            description: 'Génère la documentation pour ce code',
            handler: (args) => `Génère la documentation pour ce code :\n${args}`,
        });
        this.pluginRegistry.slashCommands.register({
            trigger: '/review',
            description: 'Fais une revue de ce code',
            handler: (args) => `Fais une revue de ce code et identifie les problèmes :\n${args}`,
        });
        this.pluginRegistry.slashCommands.register({
            trigger: '/explain',
            description: 'Explique ce code en détail',
            handler: (args) => `Explique ce code en détail :\n${args}`,
        });
    }
    resolveWebviewView(webviewView) {
        this.webviewView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };
        webviewView.webview.html = this.getHtml(webviewView.webview);
        // Check auth state on webview init
        const isDevMode = vscode.workspace.getConfiguration('marcelia').get('devMode', false);
        // Wait for webview to be ready before sending messages
        const setupAuthState = () => {
            if (isDevMode) {
                // Explicitly hide login screen in dev mode
                this.postToWebview({ type: 'hideLoginScreen' });
            }
            else {
                // Check if already signed in
                if (this.authProvider.isSignedIn()) {
                    // User is already authenticated, hide login screen
                    this.postToWebview({ type: 'hideLoginScreen' });
                }
                else {
                    // No session yet, try to restore silently or show login
                    this.authProvider.ensureAuthenticated().then((authenticated) => {
                        if (authenticated) {
                            this.postToWebview({ type: 'hideLoginScreen' });
                        }
                        else {
                            this.postToWebview({ type: 'showLoginScreen' });
                        }
                    }).catch(() => {
                        this.postToWebview({ type: 'showLoginScreen' });
                    });
                }
            }
        };
        // Send initial auth state after a short delay to ensure webview is ready
        setTimeout(setupAuthState, 100);
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'sendMessage':
                    await this.handleUserMessage(message.text);
                    break;
                case 'clearHistory':
                    this.history = [];
                    break;
                case 'toolApproval': {
                    const pending = this.pendingConfirmations.get(message.toolId);
                    if (pending) {
                        this.pendingConfirmations.delete(message.toolId);
                        pending.resolve(message.approved);
                    }
                    break;
                }
                case 'signIn': {
                    const session = await this.authProvider.signIn();
                    if (session) {
                        this.postToWebview({ type: 'hideLoginScreen' });
                    }
                    break;
                }
            }
        });
    }
    async sendMessageToChat(text) {
        if (this.webviewView) {
            this.webviewView.webview.postMessage({ type: 'setInput', text });
        }
    }
    async handleUserMessage(text) {
        // Check auth gate (skip in dev mode)
        const devMode = vscode.workspace.getConfiguration('marcelia').get('devMode', false);
        if (!devMode && !this.authProvider.isSignedIn()) {
            this.postToWebview({ type: 'showLoginScreen' });
            return;
        }
        // Slash command dispatch via registry
        let processedText = text;
        const slashMatch = text.match(/^(\/\S+)\s*(.*)/s);
        if (slashMatch) {
            const result = this.pluginRegistry.slashCommands.execute(slashMatch[1], slashMatch[2]);
            if (result !== null) {
                processedText = result;
            }
        }
        // Message preprocessing via plugin pipeline
        try {
            processedText = this.pluginRegistry.messagePipeline.preprocess(processedText);
        }
        catch {
            // Plugin preprocessor error — continue with original text
        }
        const ctx = (0, context_collector_1.collectContext)();
        let systemInfo = '';
        if (ctx.currentFile) {
            systemInfo = `[Current file: ${ctx.currentFile}, Language: ${ctx.currentLanguage}]`;
        }
        this.history.push({ role: 'user', content: processedText });
        this.postToWebview({ type: 'userMessage', text });
        this.postToWebview({ type: 'assistantStart' });
        try {
            const config = vscode.workspace.getConfiguration('marcelia');
            const workspaceEnabled = config.get('workspaceContextEnabled', true);
            let codebaseContext = undefined;
            if (workspaceEnabled) {
                const treeCtx = await this.workspaceScanner.getFileTree();
                if (treeCtx) {
                    const activeFiles = [];
                    if (ctx.currentFile) {
                        const relPath = vscode.workspace.asRelativePath(ctx.currentFile, false);
                        const fileContent = await this.workspaceScanner.readFile(relPath);
                        if (fileContent) {
                            activeFiles.push({
                                path: fileContent.path,
                                language: fileContent.language,
                                content: fileContent.content,
                            });
                        }
                    }
                    codebaseContext = {
                        rootName: treeCtx.rootName,
                        fileTree: treeCtx.fileTree,
                        files: activeFiles.length > 0 ? activeFiles : undefined,
                    };
                    this.postToWebview({
                        type: 'workspaceInfo',
                        text: `Workspace: ${treeCtx.rootName} (${treeCtx.totalFiles} fichiers)`,
                    });
                }
            }
            let systemPrompt = systemInfo
                ? `Tu es Marcel'IA, un assistant IA de développement pour les développeurs ERANOVE/GS2E. Réponds toujours en français. ${systemInfo}`
                : "Tu es Marcel'IA, un assistant IA de développement pour les développeurs ERANOVE/GS2E. Réponds toujours en français.";
            // Apply plugin prompt transformers
            try {
                systemPrompt = this.pluginRegistry.promptTransformers.transform(systemPrompt, {
                    codebaseContext: codebaseContext ? {
                        rootName: codebaseContext.rootName,
                        fileTree: codebaseContext.fileTree,
                    } : undefined,
                    conversationLength: this.history.length,
                });
            }
            catch {
                // Plugin transformer error — continue with original prompt
            }
            await this.streamWithToolLoop(systemPrompt, codebaseContext);
        }
        catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error';
            // Detect 401/auth errors and redirect to login screen
            if (errMsg.includes('401') || errMsg.includes('Authentification requise')) {
                this.postToWebview({ type: 'showLoginScreen' });
                this.postToWebview({ type: 'error', text: 'Session expirée. Veuillez vous reconnecter.' });
            }
            else {
                this.postToWebview({ type: 'error', text: errMsg });
            }
        }
    }
    trimHistory() {
        if (this.history.length <= MAX_HISTORY_MESSAGES)
            return;
        // Truncate tool_result content in older messages to save tokens
        const cutoff = this.history.length - MAX_HISTORY_MESSAGES;
        for (let i = 0; i < cutoff; i++) {
            const msg = this.history[i];
            if (Array.isArray(msg.content)) {
                msg.content = msg.content.map((block) => {
                    if (block.type === 'tool_result' && typeof block.content === 'string' && block.content.length > TOOL_RESULT_TRUNCATE_CHARS) {
                        return { ...block, content: block.content.slice(0, TOOL_RESULT_TRUNCATE_CHARS) + '\n[...tronqué]' };
                    }
                    return block;
                });
            }
        }
        // Drop oldest message pairs (keep at least the last MAX_HISTORY_MESSAGES)
        if (this.history.length > MAX_HISTORY_MESSAGES * 2) {
            this.history = this.history.slice(-MAX_HISTORY_MESSAGES);
        }
    }
    async streamWithToolLoop(systemPrompt, codebaseContext, round = 0) {
        if (round >= MAX_TOOL_ROUNDS) {
            this.postToWebview({ type: 'assistantDelta', text: '\n\n[Limite de tours atteinte]' });
            this.postToWebview({ type: 'assistantDone' });
            return;
        }
        this.trimHistory();
        const pluginToolSchemas = this.pluginRegistry.tools.getSchemas();
        const requestBody = {
            messages: this.history,
            systemPrompt,
            codebaseContext,
            ...(pluginToolSchemas.length > 0 ? { pluginTools: pluginToolSchemas } : {}),
        };
        const stream = await this.apiClient.postStream('/chat', requestBody);
        let fullResponse = '';
        const pendingToolCalls = [];
        let stopReason = 'end_turn';
        await (0, streaming_client_1.parseSSEStream)(stream, {
            onText: (text) => {
                fullResponse += text;
                this.postToWebview({ type: 'assistantDelta', text });
            },
            onToolStart: (toolId, toolName) => {
                this.postToWebview({ type: 'toolStart', toolId, toolName });
                // For write_file, set up real-time content extraction
                if (toolName === 'write_file') {
                    const extractor = new json_content_extractor_1.JsonContentExtractor({
                        watchKeys: ['path', 'content'],
                        streamKey: 'content',
                        onEvent: (event) => {
                            if (event.type === 'key_value' && event.key === 'path') {
                                this.streamedToolPaths.set(toolId, event.value);
                                this.postToWebview({ type: 'toolPath', toolId, path: event.value });
                                this.startStreamingToEditor(event.value).catch(() => {
                                    // Editor streaming failed — file will be written via executeTool fallback
                                });
                            }
                            else if (event.type === 'content_chunk') {
                                this.streamingEditor.appendContent(event.value);
                            }
                            else if (event.type === 'content_done') {
                                this.streamingEditor.finalize().catch(() => {
                                    // Finalize failed — executeTool will handle the final write
                                });
                                this.postToWebview({ type: 'toolContentDone', toolId });
                            }
                        },
                    });
                    this.activeExtractors.set(toolId, extractor);
                }
            },
            onToolInputDelta: (toolId, _toolName, partialJson) => {
                const extractor = this.activeExtractors.get(toolId);
                if (extractor) {
                    extractor.feed(partialJson);
                }
            },
            onToolUse: (toolCall) => {
                this.activeExtractors.delete(toolCall.id);
                pendingToolCalls.push(toolCall);
                this.postToWebview({
                    type: 'toolAction',
                    toolId: toolCall.id,
                    tool: toolCall.name,
                    path: toolCall.input.path || '',
                });
            },
            onStopReason: (reason) => {
                stopReason = reason;
            },
            onDone: () => { },
            onError: (error) => {
                this.postToWebview({ type: 'error', text: error });
            },
        });
        if (stopReason === 'tool_use' && pendingToolCalls.length > 0) {
            const assistantContent = [];
            if (fullResponse) {
                assistantContent.push({ type: 'text', text: fullResponse });
            }
            for (const tc of pendingToolCalls) {
                assistantContent.push({ type: 'tool_use', id: tc.id, name: tc.name, input: tc.input });
            }
            this.history.push({ role: 'assistant', content: assistantContent });
            const toolResultBlocks = [];
            for (const toolCall of pendingToolCalls) {
                const result = await this.executeTool(toolCall);
                toolResultBlocks.push({
                    type: 'tool_result',
                    tool_use_id: result.toolCallId,
                    content: result.content,
                    is_error: result.isError || false,
                });
            }
            this.history.push({ role: 'user', content: toolResultBlocks });
            await this.streamWithToolLoop(systemPrompt, codebaseContext, round + 1);
        }
        else {
            let processedResponse = fullResponse;
            try {
                processedResponse = this.pluginRegistry.messagePipeline.postprocess(fullResponse);
            }
            catch {
                // Plugin postprocessor error — use original response
            }
            this.history.push({ role: 'assistant', content: processedResponse });
            this.postToWebview({ type: 'assistantDone' });
        }
    }
    async startStreamingToEditor(relativePath) {
        const rootFolder = this.workspaceScanner.getRootFolder();
        if (!rootFolder)
            return;
        await this.streamingEditor.openForStreaming(rootFolder, relativePath);
    }
    async executeTool(toolCall) {
        const { id, name, input } = toolCall;
        const config = vscode.workspace.getConfiguration('marcelia');
        const confirmLevel = config.get('toolConfirmation', 'write-only');
        const rootFolder = this.workspaceScanner.getRootFolder();
        try {
            switch (name) {
                case 'read_file': {
                    const file = await this.workspaceScanner.readFile(input.path);
                    if (!file) {
                        return { toolCallId: id, content: `Error: file not found: ${input.path}`, isError: true };
                    }
                    this.postToWebview({ type: 'toolStatus', toolId: id, status: 'done', label: `Lu: ${input.path}` });
                    return { toolCallId: id, content: file.content };
                }
                case 'write_file': {
                    const wasStreamed = this.streamedToolPaths.has(id);
                    this.streamedToolPaths.delete(id);
                    if (confirmLevel === 'always' || confirmLevel === 'write-only') {
                        const confirmed = await this.requestInlineConfirmation(id, `Créer/écrire: ${input.path}`);
                        if (!confirmed) {
                            // Revert: cancel streaming and delete the partial file
                            if (wasStreamed && rootFolder) {
                                await this.streamingEditor.revert(rootFolder, input.path);
                            }
                            this.postToWebview({ type: 'toolStatus', toolId: id, status: 'denied', label: `Refusé: ${input.path}` });
                            return { toolCallId: id, content: 'User denied the file write operation.', isError: true };
                        }
                    }
                    // Finalize streaming session (flush remaining content) after approval
                    await this.streamingEditor.finalize();
                    // Always write the full content to ensure the file is complete,
                    // even if streaming partially succeeded
                    const success = await this.workspaceScanner.writeFile(input.path, input.content);
                    if (!success) {
                        return { toolCallId: id, content: `Error: could not write file: ${input.path}`, isError: true };
                    }
                    // If not already open in editor (streaming opened it), open now
                    if (!wasStreamed) {
                        await this.openFileInEditor(input.path);
                    }
                    this.postToWebview({ type: 'toolStatus', toolId: id, status: 'done', label: `Créé: ${input.path}` });
                    return { toolCallId: id, content: `File written successfully: ${input.path}` };
                }
                case 'edit_file': {
                    if (confirmLevel === 'always' || confirmLevel === 'write-only') {
                        const confirmed = await this.requestInlineConfirmation(id, `Modifier: ${input.path}`);
                        if (!confirmed) {
                            this.postToWebview({ type: 'toolStatus', toolId: id, status: 'denied', label: `Refusé: ${input.path}` });
                            return { toolCallId: id, content: 'User denied the file edit operation.', isError: true };
                        }
                    }
                    const success = await this.workspaceScanner.editFile(input.path, input.old_text, input.new_text);
                    if (!success) {
                        return { toolCallId: id, content: `Error: could not edit file (text not found): ${input.path}`, isError: true };
                    }
                    await this.openFileInEditor(input.path);
                    this.postToWebview({ type: 'toolStatus', toolId: id, status: 'done', label: `Modifié: ${input.path}` });
                    return { toolCallId: id, content: `File edited successfully: ${input.path}` };
                }
                case 'create_directory': {
                    const success = await this.workspaceScanner.createDirectory(input.path);
                    if (!success) {
                        return { toolCallId: id, content: `Error: could not create directory: ${input.path}`, isError: true };
                    }
                    this.postToWebview({ type: 'toolStatus', toolId: id, status: 'done', label: `Dossier créé: ${input.path}` });
                    return { toolCallId: id, content: `Directory created: ${input.path}` };
                }
                case 'list_files': {
                    const files = await this.workspaceScanner.listFiles(input.path, input.pattern);
                    this.postToWebview({ type: 'toolStatus', toolId: id, status: 'done', label: `${files.length} fichiers listés` });
                    return { toolCallId: id, content: files.join('\n') || 'No files found.' };
                }
                default: {
                    // Check plugin tools registry
                    if (this.pluginRegistry.tools.has(name)) {
                        const result = await this.pluginRegistry.tools.execute(name, input);
                        this.postToWebview({ type: 'toolStatus', toolId: id, status: 'done', label: `Plugin: ${name}` });
                        return { toolCallId: id, content: result.content, isError: result.isError };
                    }
                    return { toolCallId: id, content: `Unknown tool: ${name}`, isError: true };
                }
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Tool execution error';
            return { toolCallId: id, content: `Error: ${msg}`, isError: true };
        }
    }
    requestInlineConfirmation(toolId, action) {
        return new Promise((resolve) => {
            this.pendingConfirmations.set(toolId, { resolve });
            this.postToWebview({ type: 'toolConfirmation', toolId, action });
            // Auto-deny after 60 seconds
            setTimeout(() => {
                if (this.pendingConfirmations.has(toolId)) {
                    this.pendingConfirmations.delete(toolId);
                    resolve(false);
                    this.postToWebview({ type: 'toolConfirmationExpired', toolId });
                }
            }, 60000);
        });
    }
    async openFileInEditor(relativePath) {
        const rootFolder = this.workspaceScanner.getRootFolder();
        if (!rootFolder)
            return;
        const uri = vscode.Uri.joinPath(rootFolder.uri, relativePath);
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const doc = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(doc, {
                    preview: false,
                    preserveFocus: true,
                    viewColumn: vscode.ViewColumn.Beside,
                });
                return;
            }
            catch {
                if (attempt === 0) {
                    await new Promise(r => setTimeout(r, 200));
                }
            }
        }
    }
    postToWebview(message) {
        this.webviewView?.webview.postMessage(message);
    }
    getHtml(webview) {
        const nonce = getNonce();
        const isDevMode = vscode.workspace.getConfiguration('marcelia').get('devMode', false);
        const loginScreenClass = isDevMode ? '' : 'visible';
        const appContentClass = isDevMode ? '' : 'hidden';
        return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <style nonce="${nonce}">
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    #chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
    .message {
      margin-bottom: 16px;
      padding: 8px 12px;
      border-radius: 8px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .message.user {
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      white-space: pre-wrap;
    }
    .message.assistant {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-editorWidget-border);
      white-space: normal;
    }
    .message .role {
      font-weight: bold;
      font-size: 0.85em;
      margin-bottom: 4px;
      color: var(--vscode-descriptionForeground);
    }
    .message code {
      background: var(--vscode-textCodeBlock-background);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
    }
    .message pre {
      background: var(--vscode-textCodeBlock-background);
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
    }
    .message pre code {
      background: none;
      padding: 0;
    }
    .typing-indicator {
      opacity: 0.6;
      font-style: italic;
    }
    #input-container {
      padding: 8px 12px;
      border-top: 1px solid var(--vscode-editorWidget-border);
      display: flex;
      gap: 8px;
    }
    #message-input {
      flex: 1;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      padding: 8px;
      font-family: inherit;
      font-size: inherit;
      resize: none;
      min-height: 36px;
      max-height: 120px;
    }
    #message-input:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }
    #send-btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: inherit;
    }
    #send-btn:hover {
      background: var(--vscode-button-hoverBackground);
    }
    #send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .toolbar {
      padding: 4px 12px;
      display: flex;
      justify-content: flex-end;
    }
    .toolbar button {
      background: none;
      border: none;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      font-size: 0.85em;
      padding: 2px 8px;
    }
    .toolbar button:hover {
      color: var(--vscode-foreground);
    }
    .error-msg {
      color: var(--vscode-errorForeground);
      background: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    #workspace-info {
      padding: 4px 12px;
      font-size: 0.8em;
      color: var(--vscode-descriptionForeground);
      background: var(--vscode-editor-background);
      border-bottom: 1px solid var(--vscode-editorWidget-border);
      display: none;
    }
    .tool-card {
      margin: 8px 0;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--vscode-editorWidget-border);
      background: var(--vscode-editor-background);
      font-size: 0.9em;
      white-space: normal;
    }
    .tool-card .tool-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      margin-bottom: 2px;
    }
    .tool-card .tool-path {
      color: var(--vscode-textLink-foreground);
      font-family: var(--vscode-editor-font-family);
      font-size: 0.85em;
      margin-bottom: 2px;
    }
    .tool-card .tool-status {
      font-size: 0.85em;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
    .tool-card .tool-status.writing {
      color: var(--vscode-charts-yellow, #cca700);
    }
    .tool-card .tool-status.done {
      color: var(--vscode-charts-green, #388a34);
    }
    .tool-card .tool-status.denied {
      color: var(--vscode-errorForeground);
    }
    .tool-card .tool-status.expired {
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
    .tool-card .tool-progress {
      height: 2px;
      background: var(--vscode-progressBar-background);
      margin-top: 4px;
      border-radius: 1px;
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
    .tool-card .confirm-btns {
      display: flex;
      gap: 8px;
      margin-top: 6px;
      align-items: center;
    }
    .tool-card .confirm-btns .confirm-label {
      font-size: 0.85em;
      flex: 1;
    }
    .tool-card .confirm-btns button {
      padding: 3px 10px;
      border-radius: 3px;
      border: none;
      cursor: pointer;
      font-size: 0.85em;
    }
    .tool-card .btn-approve {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .tool-card .btn-approve:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .tool-card .btn-deny {
      background: var(--vscode-button-secondaryBackground, #333);
      color: var(--vscode-button-secondaryForeground, #fff);
    }
    #login-screen {
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 24px;
      text-align: center;
      gap: 16px;
    }
    #login-screen.visible {
      display: flex;
    }
    #login-screen h2 {
      font-size: 1.2em;
      font-weight: 600;
    }
    #login-screen p {
      color: var(--vscode-descriptionForeground);
      max-width: 280px;
      line-height: 1.4;
    }
    #login-screen button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      padding: 10px 24px;
      cursor: pointer;
      font-size: 1em;
    }
    #login-screen button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .app-content { display: flex; flex-direction: column; height: 100vh; }
    .app-content.hidden { display: none; }
    .message h1, .message h2, .message h3 {
      font-weight: 600;
      margin: 8px 0 4px;
      line-height: 1.3;
    }
    .message h1 { font-size: 1.15em; }
    .message h2 { font-size: 1.05em; }
    .message h3 { font-size: 0.95em; }
    .message ul, .message ol {
      padding-left: 20px;
      margin: 4px 0;
    }
    .message li {
      margin: 2px 0;
    }
    .tool-card {
      animation: slideIn 0.15s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .tool-card[data-tool="write_file"]       { border-left: 3px solid var(--vscode-charts-blue, #007acc); }
    .tool-card[data-tool="edit_file"]        { border-left: 3px solid var(--vscode-charts-orange, #d18616); }
    .tool-card[data-tool="read_file"]        { border-left: 3px solid var(--vscode-charts-purple, #6f42c1); }
    .tool-card[data-tool="create_directory"] { border-left: 3px solid var(--vscode-charts-green, #388a34); }
    .tool-card[data-tool="list_files"]       { border-left: 3px solid var(--vscode-charts-yellow, #cca700); }
    .tool-group {
      border: 1px solid var(--vscode-editorWidget-border);
      border-radius: 6px;
      padding: 4px;
      margin: 8px 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: var(--vscode-editor-background);
    }
    .tool-group .tool-card {
      margin: 0;
      border: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div id="login-screen" class="${loginScreenClass}">
    <h2>Connexion requise</h2>
    <p>Connectez-vous avec votre compte ERANOVE pour acc\u00e9der \u00e0 Marcel'IA</p>
    <button id="login-btn">Se connecter</button>
  </div>
  <div class="app-content ${appContentClass}" id="app-content">
    <div class="toolbar">
      <button id="clear-btn" title="Effacer l'historique">Effacer</button>
    </div>
    <div id="workspace-info"></div>
    <div id="chat-container"></div>
    <div id="input-container">
      <textarea id="message-input" placeholder="Posez une question... (/test, /doc, /review, /explain)" rows="1"></textarea>
      <button id="send-btn">Envoyer</button>
    </div>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const chatContainer = document.getElementById('chat-container');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const clearBtn = document.getElementById('clear-btn');
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const loginBtn = document.getElementById('login-btn');
    let currentAssistantEl = null;
    let isStreaming = false;
    let fullAssistantText = '';
    let renderPending = false;

    loginBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'signIn' });
    });

    const TOOL_ICONS = {
      'write_file': '\\u{1F4DD}',
      'read_file': '\\u{1F4D6}',
      'edit_file': '\\u270F\\uFE0F',
      'create_directory': '\\u{1F4C1}',
      'list_files': '\\u{1F4CB}',
    };

    const TOOL_LABELS = {
      'write_file': 'Cr\\u00e9ation de fichier',
      'read_file': 'Lecture de fichier',
      'edit_file': 'Modification de fichier',
      'create_directory': 'Cr\\u00e9ation de dossier',
      'list_files': 'Liste des fichiers',
    };

    const FILE_EXT_ICONS = {
      ts: '\\u{1F537}', tsx: '\\u{1F537}', js: '\\u{1F7E8}', jsx: '\\u{1F7E8}',
      py: '\\u{1F40D}', java: '\\u2615', go: '\\u{1F439}', rs: '\\u{1F980}',
      json: '{}', yaml: '\\u{1F4CB}', yml: '\\u{1F4CB}',
      md: '\\u{1F4DD}', html: '\\u{1F310}', css: '\\u{1F3A8}', scss: '\\u{1F3A8}',
      sh: '\\u{1F4BB}', sql: '\\u{1F5C4}',
    };

    function getFileIcon(path) {
      if (!path) return '\\u{1F4C4}';
      const ext = path.split('.').pop().toLowerCase();
      return FILE_EXT_ICONS[ext] || '\\u{1F4C4}';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function renderMarkdown(text) {
      const segments = [];
      const fenceRe = /\`\`\`(\\w*)\\n?([\\s\\S]*?)\`\`\`/g;
      let lastIndex = 0;
      let match;
      while ((match = fenceRe.exec(text)) !== null) {
        segments.push({ type: 'inline', text: text.slice(lastIndex, match.index) });
        segments.push({ type: 'code', lang: match[1], code: match[2] });
        lastIndex = match.index + match[0].length;
      }
      segments.push({ type: 'inline', text: text.slice(lastIndex) });

      let html = '';
      for (const seg of segments) {
        if (seg.type === 'code') {
          html += '<pre><code>' + escapeHtml(seg.code) + '</code></pre>';
        } else {
          html += processInlineMarkdown(seg.text);
        }
      }
      return html;
    }

    function processInlineMarkdown(text) {
      const lines = text.split('\\n');
      let html = '';
      let listTag = '';

      for (const line of lines) {
        const h3 = line.match(/^### (.+)/);
        const h2 = line.match(/^## (.+)/);
        const h1 = line.match(/^# (.+)/);
        const li = line.match(/^[-*] (.+)/);
        const oli = line.match(/^\\d+\\. (.+)/);

        if (listTag && !li && !oli) {
          html += '</' + listTag + '>';
          listTag = '';
        }

        if (h3) {
          html += '<h3>' + inlineFormat(escapeHtml(h3[1])) + '</h3>';
        } else if (h2) {
          html += '<h2>' + inlineFormat(escapeHtml(h2[1])) + '</h2>';
        } else if (h1) {
          html += '<h1>' + inlineFormat(escapeHtml(h1[1])) + '</h1>';
        } else if (li) {
          if (!listTag) { html += '<ul>'; listTag = 'ul'; }
          html += '<li>' + inlineFormat(escapeHtml(li[1])) + '</li>';
        } else if (oli) {
          if (!listTag) { html += '<ol>'; listTag = 'ol'; }
          html += '<li>' + inlineFormat(escapeHtml(oli[1])) + '</li>';
        } else if (line.trim() === '') {
          html += '<br>';
        } else {
          html += inlineFormat(escapeHtml(line)) + '<br>';
        }
      }
      if (listTag) html += '</' + listTag + '>';
      return html;
    }

    function inlineFormat(text) {
      text = text.replace(/\`([^\`]+)\`/g, function(_, code) {
        return '<code>' + code + '</code>';
      });
      text = text.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
      text = text.replace(/(?<!\\*)\\*(?!\\*)([^*]+)(?<!\\*)\\*(?!\\*)/g, '<em>$1</em>');
      return text;
    }

    function addMessage(role, text) {
      const div = document.createElement('div');
      div.className = 'message ' + role;
      const contentHtml = role === 'assistant' ? '' : escapeHtml(text);
      div.innerHTML = '<div class="role">' + (role === 'user' ? 'Vous' : "Marcel'IA") + '</div><div class="content">' + contentHtml + '</div>';
      chatContainer.appendChild(div);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      return div;
    }

    function appendToolCard(card) {
      if (!currentAssistantEl) {
        chatContainer.appendChild(card);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return;
      }
      const content = currentAssistantEl.querySelector('.content');
      const lastChild = content.lastElementChild;

      if (lastChild && lastChild.classList.contains('tool-card')) {
        const group = document.createElement('div');
        group.className = 'tool-group';
        content.insertBefore(group, lastChild);
        group.appendChild(lastChild);
        group.appendChild(card);
      } else if (lastChild && lastChild.classList.contains('tool-group')) {
        lastChild.appendChild(card);
      } else {
        content.appendChild(card);
      }
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function getOrCreateToolCard(toolId, toolName) {
      let card = document.getElementById('tool-' + toolId);
      if (card) return card;

      if (currentAssistantEl) {
        const content = currentAssistantEl.querySelector('.content');
        const typing = content.querySelector('.typing-indicator');
        if (typing) typing.remove();
      }

      card = document.createElement('div');
      card.className = 'tool-card';
      card.id = 'tool-' + toolId;
      card.dataset.tool = toolName;

      const icon = TOOL_ICONS[toolName] || '\\u{1F527}';
      const label = TOOL_LABELS[toolName] || escapeHtml(toolName);

      card.innerHTML =
        '<div class="tool-header"><span>' + icon + '</span><span>' + label + '</span></div>' +
        '<div class="tool-path"></div>' +
        '<div class="tool-status writing">En cours...</div>' +
        '<div class="tool-progress"></div>';

      appendToolCard(card);
      return card;
    }

    function sendMessage() {
      const text = messageInput.value.trim();
      if (!text || isStreaming) return;
      vscode.postMessage({ type: 'sendMessage', text });
      messageInput.value = '';
      messageInput.style.height = 'auto';
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });

    clearBtn.addEventListener('click', () => {
      chatContainer.innerHTML = '';
      vscode.postMessage({ type: 'clearHistory' });
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      switch (msg.type) {
        case 'userMessage':
          addMessage('user', msg.text);
          break;
        case 'assistantStart':
          isStreaming = true;
          sendBtn.disabled = true;
          fullAssistantText = '';
          currentAssistantEl = addMessage('assistant', '');
          currentAssistantEl.querySelector('.content').innerHTML = '<span class="typing-indicator">En train de r\\u00e9fl\\u00e9chir...</span>';
          break;
        case 'assistantDelta':
          if (currentAssistantEl) {
            fullAssistantText += msg.text;
            // Remove typing indicator on first delta
            const firstContent = currentAssistantEl.querySelector('.content');
            const typing = firstContent.querySelector('.typing-indicator');
            if (typing) typing.remove();
            // Throttle re-renders via requestAnimationFrame
            if (!renderPending) {
              renderPending = true;
              requestAnimationFrame(() => {
                renderPending = false;
                if (!currentAssistantEl) return;
                const content = currentAssistantEl.querySelector('.content');
                const toolCards = Array.from(content.querySelectorAll('.tool-card, .tool-group'));
                content.innerHTML = renderMarkdown(fullAssistantText);
                for (const card of toolCards) {
                  content.appendChild(card);
                }
                chatContainer.scrollTop = chatContainer.scrollHeight;
              });
            }
          }
          break;
        case 'assistantDone':
          isStreaming = false;
          sendBtn.disabled = false;
          fullAssistantText = '';
          currentAssistantEl = null;
          break;

        // Tool lifecycle events
        case 'toolStart': {
          getOrCreateToolCard(msg.toolId, msg.toolName);
          break;
        }
        case 'toolPath': {
          const card = document.getElementById('tool-' + msg.toolId);
          if (card) {
            card.querySelector('.tool-path').textContent = getFileIcon(msg.path) + ' ' + msg.path;
          }
          chatContainer.scrollTop = chatContainer.scrollHeight;
          break;
        }
        case 'toolContentDone': {
          const card = document.getElementById('tool-' + msg.toolId);
          if (card) {
            const status = card.querySelector('.tool-status');
            status.textContent = '\\u00c9criture termin\\u00e9e';
            status.className = 'tool-status done';
            const bar = card.querySelector('.tool-progress');
            if (bar) bar.remove();
          }
          break;
        }
        case 'toolAction': {
          const card = getOrCreateToolCard(msg.toolId || msg.tool, msg.tool);
          if (msg.path && card) {
            card.querySelector('.tool-path').textContent = getFileIcon(msg.path) + ' ' + msg.path;
          }
          break;
        }
        case 'toolStatus': {
          const card = document.getElementById('tool-' + msg.toolId);
          if (card) {
            const status = card.querySelector('.tool-status');
            status.textContent = msg.label;
            status.className = 'tool-status ' + msg.status;
            const bar = card.querySelector('.tool-progress');
            if (bar) bar.remove();
          }
          break;
        }
        case 'toolConfirmation': {
          const card = document.getElementById('tool-' + msg.toolId);
          const target = card || currentAssistantEl?.querySelector('.content');
          if (!target) break;

          // Remove progress bar during confirmation
          if (card) {
            const bar = card.querySelector('.tool-progress');
            if (bar) bar.remove();
            const status = card.querySelector('.tool-status');
            if (status) status.textContent = 'En attente de confirmation...';
          }

          const btns = document.createElement('div');
          btns.className = 'confirm-btns';
          btns.innerHTML =
            '<span class="confirm-label">' + escapeHtml(msg.action) + '</span>' +
            '<button class="btn-approve">Autoriser</button>' +
            '<button class="btn-deny">Refuser</button>';

          btns.querySelector('.btn-approve').addEventListener('click', () => {
            vscode.postMessage({ type: 'toolApproval', toolId: msg.toolId, approved: true });
            btns.innerHTML = '<span class="tool-status done">Autoris\\u00e9</span>';
          });
          btns.querySelector('.btn-deny').addEventListener('click', () => {
            vscode.postMessage({ type: 'toolApproval', toolId: msg.toolId, approved: false });
            btns.innerHTML = '<span class="tool-status denied">Refus\\u00e9</span>';
          });

          (card || target).appendChild(btns);
          chatContainer.scrollTop = chatContainer.scrollHeight;
          break;
        }
        case 'toolConfirmationExpired': {
          const card = document.getElementById('tool-' + msg.toolId);
          if (card) {
            const btns = card.querySelector('.confirm-btns');
            if (btns) {
              btns.innerHTML = '<span class="tool-status expired">Expir\\u00e9</span>';
            }
          }
          break;
        }

        case 'error':
          isStreaming = false;
          sendBtn.disabled = false;
          const errDiv = document.createElement('div');
          errDiv.className = 'error-msg';
          errDiv.textContent = 'Erreur: ' + msg.text;
          chatContainer.appendChild(errDiv);
          chatContainer.scrollTop = chatContainer.scrollHeight;
          break;
        case 'workspaceInfo':
          const wsInfo = document.getElementById('workspace-info');
          wsInfo.textContent = msg.text;
          wsInfo.style.display = 'block';
          break;
        case 'setInput':
          messageInput.value = msg.text;
          messageInput.style.height = 'auto';
          messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
          break;
        case 'showLoginScreen':
          loginScreen.classList.add('visible');
          appContent.classList.add('hidden');
          break;
        case 'hideLoginScreen':
          loginScreen.classList.remove('visible');
          appContent.classList.remove('hidden');
          break;
      }
    });
  </script>
</body>
</html>`;
    }
}
exports.ChatViewProvider = ChatViewProvider;
function getNonce() {
    let text = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}


/***/ },

/***/ "vscode"
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
(module) {

module.exports = require("vscode");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/extension.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map