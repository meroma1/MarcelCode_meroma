import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Service pour créer des fichiers et dossiers en dehors du workspace VS Code
 * Utilise Node.js fs pour accéder au système de fichiers directement
 */
export class AbsolutePathService {
  /**
   * Crée un dossier et tous les dossiers parents nécessaires
   */
  async createDirectory(absolutePath: string): Promise<boolean> {
    try {
      // Normaliser le chemin (résoudre les .., ./, etc.)
      const normalizedPath = path.normalize(absolutePath);
      
      // Vérifier que le chemin est absolu
      if (!path.isAbsolute(normalizedPath)) {
        throw new Error(`Le chemin doit être absolu: ${absolutePath}`);
      }

      // Créer le dossier récursivement
      await fs.promises.mkdir(normalizedPath, { recursive: true });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      vscode.window.showErrorMessage(`Erreur lors de la création du dossier: ${msg}`);
      return false;
    }
  }

  /**
   * Crée un fichier avec son contenu, et crée les dossiers parents si nécessaire
   */
  async createFile(absolutePath: string, content: string): Promise<boolean> {
    try {
      // Normaliser le chemin
      const normalizedPath = path.normalize(absolutePath);
      
      // Vérifier que le chemin est absolu
      if (!path.isAbsolute(normalizedPath)) {
        throw new Error(`Le chemin doit être absolu: ${absolutePath}`);
      }

      // Créer les dossiers parents si nécessaire
      const dir = path.dirname(normalizedPath);
      await fs.promises.mkdir(dir, { recursive: true });

      // Créer le fichier avec son contenu
      await fs.promises.writeFile(normalizedPath, content, 'utf-8');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      vscode.window.showErrorMessage(`Erreur lors de la création du fichier: ${msg}`);
      return false;
    }
  }

  /**
   * Vérifie si un chemin existe
   */
  async pathExists(absolutePath: string): Promise<boolean> {
    try {
      const normalizedPath = path.normalize(absolutePath);
      await fs.promises.access(normalizedPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lit le contenu d'un fichier
   */
  async readFile(absolutePath: string): Promise<string | null> {
    try {
      const normalizedPath = path.normalize(absolutePath);
      const content = await fs.promises.readFile(normalizedPath, 'utf-8');
      return content;
    } catch (err) {
      return null;
    }
  }

  /**
   * Modifie un fichier en remplaçant une section de texte
   */
  async editFile(absolutePath: string, oldText: string, newText: string): Promise<boolean> {
    try {
      const normalizedPath = path.normalize(absolutePath);
      
      // Vérifier que le chemin est absolu
      if (!path.isAbsolute(normalizedPath)) {
        throw new Error(`Le chemin doit être absolu: ${absolutePath}`);
      }

      // Lire le fichier actuel
      const currentContent = await this.readFile(normalizedPath);
      if (currentContent === null) {
        throw new Error(`Le fichier n'existe pas ou ne peut pas être lu: ${absolutePath}`);
      }

      // Vérifier que oldText existe dans le fichier
      if (!currentContent.includes(oldText)) {
        throw new Error(`Le texte à remplacer n'a pas été trouvé dans le fichier. Assurez-vous que old_text correspond exactement au contenu du fichier.`);
      }

      // Remplacer le texte
      const updatedContent = currentContent.replace(oldText, newText);

      // Écrire le fichier modifié
      await fs.promises.writeFile(normalizedPath, updatedContent, 'utf-8');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      vscode.window.showErrorMessage(`Erreur lors de la modification du fichier: ${msg}`);
      return false;
    }
  }
}
