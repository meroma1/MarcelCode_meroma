import { Router, Request, Response } from 'express';
import { ChatRequest, DEFAULT_MAX_TOKENS } from '@marcelia/shared';
import { createStream } from '../services/foundry.service';
import { forwardFoundryStream } from '../services/streaming.service';
import { routeRequest } from '../services/router.service';
import { getCachedResponse, setCachedResponse } from '../services/cache.service';
import { trackUsage } from '../services/usage.service';
import { logger } from '../config';
import { pluginRegistry } from '../plugin';

const WORKSPACE_TOOLS = [
  {
    name: 'read_file',
    description: 'Read the contents of a file from the workspace. Use this to examine source code before answering questions or making changes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative file path from workspace root' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Create a new file or overwrite an existing file in the workspace.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative file path from workspace root' },
        content: { type: 'string', description: 'Complete file content to write' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'edit_file',
    description: 'Edit a file by replacing a specific text section. The old_text must match exactly.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative file path from workspace root' },
        old_text: { type: 'string', description: 'Exact text to find in the file' },
        new_text: { type: 'string', description: 'Text to replace it with' },
      },
      required: ['path', 'old_text', 'new_text'],
    },
  },
  {
    name: 'create_directory',
    description: 'Create a directory and any parent directories needed.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative directory path from workspace root' },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_files',
    description: 'List files in a directory, optionally filtered by glob pattern.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative directory path (empty for root)' },
        pattern: { type: 'string', description: 'Glob pattern filter (e.g. "*.ts")' },
      },
    },
  },
  {
    name: 'run_workspace_command',
    description:
      'Execute a command in a terminal. You CAN run projects: .bat, npm, python, etc. Use this when the user asks to launch/run/execute the project. Ask confirmation then call this tool. Works in workspace folder OR in absolute path (e.g. C:\\SNACK\\) if you pass absolute_cwd.',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: {
          type: 'string',
          description:
            'Shell command to run (e.g. "npm run dev", "python main.py", "game.bat", ".\\.\\start.bat").',
        },
        cwd: {
          type: 'string',
          description:
            'Optional working directory, relative to the workspace root (e.g. "packages/api"). Omit if using absolute_cwd.',
        },
        absolute_cwd: {
          type: 'string',
          description:
            'Optional absolute working directory when the project is outside the workspace (e.g. "C:\\\\SNACK\\\\"). Use when you created files with create_absolute_path_file in a folder like C:\\SNACK\\.',
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'create_absolute_path_file',
    description: 'Create a file or directory at an absolute path on the filesystem (outside the workspace). Use this tool when the user asks to create files or folders anywhere on their computer, including on drive C: or other locations. The directory path will be created automatically if it does not exist. This tool can create files and folders outside the VS Code workspace. You can call this tool multiple times in sequence to create a complete project structure with multiple directories and files.',
    input_schema: {
      type: 'object' as const,
      properties: {
        absolute_path: { 
          type: 'string', 
          description: 'Absolute file path (e.g., "C:\\Users\\username\\Documents\\file.txt" on Windows or "/home/username/file.txt" on Linux/Mac)' 
        },
        content: { 
          type: 'string', 
          description: 'File content to write. If creating a directory, leave empty or omit this field.' 
        },
        create_as_directory: {
          type: 'boolean',
          description: 'If true, create a directory instead of a file. Defaults to false.',
        },
      },
      required: ['absolute_path'],
    },
  },
  {
    name: 'read_absolute_path_file',
    description: 'Read the contents of a file at an absolute path on the filesystem (outside the workspace). Use this tool IMMEDIATELY when the user mentions a file path starting with C:\\, D:\\, etc., or asks to explain/modify a file outside the workspace. Do NOT ask the user to copy-paste the code - you can read it yourself! After reading, you can explain the code, suggest improvements, or modify it.',
    input_schema: {
      type: 'object' as const,
      properties: {
        absolute_path: { 
          type: 'string', 
          description: 'Absolute file path to read (e.g., "C:\\Users\\username\\Documents\\file.txt" on Windows or "/home/username/file.txt" on Linux/Mac)' 
        },
      },
      required: ['absolute_path'],
    },
  },
  {
    name: 'edit_absolute_path_file',
    description: 'Edit a file at an absolute path on the filesystem (outside the workspace) by replacing a specific text section. The old_text must match exactly. Use this tool to modify code in files anywhere on the system. Always read the file first with read_absolute_path_file to see its current content before editing.',
    input_schema: {
      type: 'object' as const,
      properties: {
        absolute_path: { 
          type: 'string', 
          description: 'Absolute file path to edit (e.g., "C:\\Users\\username\\Documents\\file.txt" on Windows or "/home/username/file.txt" on Linux/Mac)' 
        },
        old_text: { 
          type: 'string', 
          description: 'Exact text to find in the file (must match exactly, including whitespace and line breaks)' 
        },
        new_text: { 
          type: 'string', 
          description: 'Text to replace it with' 
        },
      },
      required: ['absolute_path', 'old_text', 'new_text'],
    },
  },
];

const BUILT_IN_TOOL_NAMES = new Set(WORKSPACE_TOOLS.map(t => t.name));

export const chatRoutes = Router();

chatRoutes.post('/', async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string;
  const user = (req as any).user;
  const body = req.body as ChatRequest;

  try {
    const model = routeRequest('chat', body.model, user);

    // Build system prompt with lightweight context (file tree only, no file contents)
    let systemPrompt = body.systemPrompt || '';
    const hasWorkspace = !!body.codebaseContext;

    if (body.codebaseContext) {
      const { rootName, fileTree, files } = body.codebaseContext;
      let contextSection = `\nTu as accès au workspace de l'utilisateur "${rootName}".`;
      contextSection += `\n\nArborescence des fichiers :\n${fileTree}`;

      // Include active file content if provided (small, relevant)
      if (files && files.length > 0) {
        contextSection += '\n\nFichier(s) actuellement ouvert(s) dans l\'éditeur VS Code :\n';
        for (const file of files) {
          contextSection += `--- ${file.path} (${file.language}) ---\n${file.content}\n--- fin ---\n\n`;
        }
        contextSection += '\nIMPORTANT: Quand l\'utilisateur demande d\'expliquer un code, le fichier ouvert est DÉJÀ disponible ci-dessus. Tu n\'as PAS besoin d\'utiliser read_file - explique directement le code qui est déjà fourni dans le contexte. Si l\'utilisateur demande d\'expliquer "ce code" ou "ce fichier" sans préciser de chemin, il fait référence au fichier ouvert ci-dessus.';
      }

      contextSection += '\nTu disposes d\'outils pour lire, créer, modifier et lister les fichiers de ce workspace. Utilise read_file pour examiner d\'autres fichiers du workspace (pas le fichier déjà ouvert ci-dessus). Utilise write_file/edit_file pour créer ou modifier du code quand l\'utilisateur le demande.';
      
      // Add info about absolute path tools (explicit)
      contextSection += '\n\nIMPORTANT: Tu disposes également d\'outils pour travailler avec des fichiers EN DEHORS du workspace (sur le disque C:, D:, etc.) :';
      contextSection += '\n- read_absolute_path_file : pour LIRE le contenu d\'un fichier (ex: "C:\\MonProjet\\main.py")';
      contextSection += '\n- create_absolute_path_file : pour CRÉER des fichiers ou dossiers';
      contextSection += '\n- edit_absolute_path_file : pour MODIFIER un fichier existant';
      contextSection += '\n\nQuand l\'utilisateur mentionne un chemin absolu (commençant par C:\\, D:\\, etc.) ou demande d\'expliquer/modifier un fichier en dehors du workspace, utilise IMMÉDIATEMENT read_absolute_path_file pour lire le fichier, puis explique ou modifie selon la demande. Ne demande JAMAIS à l\'utilisateur de copier-coller le code - tu peux le lire toi-même !';
      
      // Add instruction about explaining code in open editor
      if (files && files.length > 0) {
        contextSection += '\n\nRAPPEL: Le fichier ouvert dans l\'éditeur est DÉJÀ disponible dans le contexte ci-dessus. Si l\'utilisateur demande d\'expliquer "ce code", "ce fichier" ou le code ouvert, explique directement sans utiliser read_file - le contenu est déjà là !';
      }
      contextSection += '\n\nTu peux créer des projets complets avec plusieurs dossiers, sous-dossiers et fichiers. Quand l\'utilisateur demande de créer un projet, crée d\'abord la structure de dossiers, puis les fichiers un par un.';

      contextSection += '\n\nEXÉCUTION DE PROJET: Tu as l\'outil run_workspace_command qui OUVRE UN TERMINAL et EXÉCUTE la commande. Tu peux donc lancer les projets. Quand l\'utilisateur demande de lancer/exécuter le projet (ou un .bat, npm, python, etc.) : 1) Détermine la commande (ex: "game.bat", "npm run dev", "python main.py"). 2) Si le projet est dans un dossier en dehors du workspace (ex: C:\\SNACK\\)), utilise le paramètre absolute_cwd avec ce chemin. 3) Demande confirmation à l\'utilisateur. 4) Appelle run_workspace_command avec command et, si besoin, absolute_cwd. Ne dis jamais que tu n\'as pas accès au système ou que tu ne peux pas exécuter : l\'outil le fait pour toi.';

      systemPrompt = systemPrompt
        ? `${systemPrompt}\n\n${contextSection}`
        : `Tu es Marcel'IA, un assistant IA de développement pour les développeurs ERANOVE/GS2E. Réponds toujours en français.\n${contextSection}`;
    } else {
      // Even without workspace, mention the absolute path tools (explicit)
      const absolutePathInfo = '\n\nIMPORTANT: Tu disposes d\'outils pour travailler avec des fichiers sur le système (disque C:, D:, etc.) :';
      const toolsInfo = '\n- read_absolute_path_file : pour LIRE le contenu d\'un fichier (ex: "C:\\MonProjet\\main.py")';
      const createInfo = '\n- create_absolute_path_file : pour CRÉER des fichiers ou dossiers';
      const editInfo = '\n- edit_absolute_path_file : pour MODIFIER un fichier existant';
      const usageInfo = '\n\nQuand l\'utilisateur mentionne un chemin absolu (commençant par C:\\, D:\\, etc.) ou demande d\'expliquer/modifier un fichier, utilise IMMÉDIATEMENT read_absolute_path_file pour lire le fichier, puis explique ou modifie selon la demande. Ne demande JAMAIS à l\'utilisateur de copier-coller le code - tu peux le lire toi-même !';
      const projectInfo = '\n\nTu peux créer des projets complets avec plusieurs dossiers, sous-dossiers et fichiers. Quand l\'utilisateur demande de créer un projet dans un langage donné, crée d\'abord la structure de dossiers, puis les fichiers nécessaires (package.json, README.md, fichiers sources, etc.) un par un.';
      const execInfo = '\n\nEXÉCUTION: Tu as l\'outil run_workspace_command pour lancer des commandes (projet, .bat, npm, python). Si l\'utilisateur demande de lancer le projet, propose la commande, demande confirmation, puis appelle run_workspace_command. Pour un projet hors workspace (ex: C:\\SNACK\\), utilise absolute_cwd. Ne dis jamais que tu n\'as pas accès au système.';
      systemPrompt = systemPrompt
        ? `${systemPrompt}${absolutePathInfo}${toolsInfo}${createInfo}${editInfo}${usageInfo}${projectInfo}${execInfo}`
        : `Tu es Marcel'IA, un assistant IA de développement pour les développeurs ERANOVE/GS2E. Réponds toujours en français.${absolutePathInfo}${toolsInfo}${createInfo}${editInfo}${usageInfo}${projectInfo}${execInfo}`;
    }

    // Apply plugin prompt extensions
    for (const ext of pluginRegistry.getPromptExtensions()) {
      systemPrompt += '\n' + ext;
    }

    // Skip cache when tools are involved (tool results vary)
    if (!hasWorkspace) {
      const cached = await getCachedResponse('chat', body.messages, model, systemPrompt);
      if (cached) {
        res.setHeader('X-Cached', 'true');
        res.json({ ...cached, cached: true });
        return;
      }
    }

    const startTime = Date.now();

    // Build messages — content can be string (text) or array (tool_use/tool_result blocks)
    const messages: Array<{ role: string; content: unknown }> = body.messages.map((m: { role: string; content: unknown }) => ({
      role: m.role,
      content: m.content,
    }));

    const stream = await createStream({
      model,
      messages,
      maxTokens: body.maxTokens || DEFAULT_MAX_TOKENS,
      systemPrompt: systemPrompt || undefined,
      tools: (() => {
        const proxyPluginTools = pluginRegistry.getTools();
        const clientPluginTools = (body.pluginTools || []).filter(
          (t: any) => t
            && typeof t.name === 'string'
            && typeof t.description === 'string'
            && t.input_schema
            && t.input_schema.type === 'object'
            && !BUILT_IN_TOOL_NAMES.has(t.name)
        );
        const allPluginTools = [...proxyPluginTools, ...clientPluginTools];
        
        // Always include absolute path tools (works outside workspace)
        const absolutePathTools = WORKSPACE_TOOLS.filter(t =>
          t.name === 'create_absolute_path_file' || 
          t.name === 'read_absolute_path_file' || 
          t.name === 'edit_absolute_path_file'
        );
        // Also include execution tool even when workspace context is not attached
        const execTools = WORKSPACE_TOOLS.filter((t) => t.name === 'run_workspace_command');
        
        let tools;
        if (hasWorkspace) {
          tools = [...WORKSPACE_TOOLS, ...allPluginTools];
        } else {
          // Even without workspace, include absolute path tools + run tool
          const alwaysTools = [...absolutePathTools, ...execTools];
          tools = alwaysTools.length > 0 || allPluginTools.length > 0
            ? [...alwaysTools, ...allPluginTools]
            : undefined;
        }
        
        // Log available tools for debugging
        if (tools && tools.length > 0) {
          const toolNames = tools.map((t: any) => t.name).join(', ');
          logger.debug({ 
            requestId, 
            hasWorkspace,
            toolCount: tools.length,
            toolNames,
            hasAbsolutePathTool: tools.some((t: any) => t.name === 'create_absolute_path_file'),
          }, 'Tools available for Claude');
        } else {
          logger.debug({ requestId, hasWorkspace }, 'No tools available for Claude');
        }
        
        return tools;
      })(),
    });

    const result = await forwardFoundryStream(stream, res, requestId);

    // Track usage async
    trackUsage({
      userId: user.id,
      requestType: 'chat',
      model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      totalTokens: result.usage.totalTokens,
      latencyMs: Date.now() - startTime,
      cached: false,
      requestId,
    }).catch((err) => logger.error({ err }, 'Usage tracking failed'));

    // Cache non-tool responses
    if (!hasWorkspace) {
      setCachedResponse('chat', body.messages, model, {
        id: result.messageId,
        content: result.content,
        model,
        usage: result.usage,
        cached: false,
      }, systemPrompt).catch((err) => logger.error({ err }, 'Cache write failed'));
    }
  } catch (err: any) {
    const errorDetails = {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      status: err?.status,
      code: err?.code,
      type: err?.type,
    };
    logger.error({ err, requestId, errorDetails }, 'Chat request failed');
    if (!res.headersSent) {
      const errorMessage = err?.message || 'Chat request failed';
      res.status(500).json({ 
        error: errorMessage, 
        code: err?.code || 'CHAT_ERROR', 
        requestId,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      });
    }
  }
});
