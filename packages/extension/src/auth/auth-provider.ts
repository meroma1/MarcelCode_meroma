import * as vscode from 'vscode';

const MICROSOFT_PROVIDER_ID = 'microsoft';
const SCOPES = ['openid', 'profile', 'email', 'offline_access'];

export class AuthProvider {
  private session: vscode.AuthenticationSession | undefined;
  private isInitialized = false;
  private readonly onDidChangeEmitter = new vscode.EventEmitter<void>();
  public readonly onDidChange = this.onDidChangeEmitter.event;

  async initializeSession(): Promise<void> {
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
    } catch {
      this.isInitialized = true;
    }
  }

  async signIn(): Promise<vscode.AuthenticationSession | undefined> {
    try {
      this.session = await vscode.authentication.getSession(MICROSOFT_PROVIDER_ID, SCOPES, {
        createIfNone: true,
      });
      this.isInitialized = true;
      this.onDidChangeEmitter.fire();
      vscode.window.showInformationMessage(
        `Marcel'IA: Connecté en tant que ${this.session.account.label}`,
      );
      return this.session;
    } catch (err) {
      vscode.window.showErrorMessage(`Marcel'IA: Échec de la connexion - ${err}`);
      return undefined;
    }
  }

  async signOut(): Promise<void> {
    this.session = undefined;
    this.onDidChangeEmitter.fire();
    vscode.window.showInformationMessage("Marcel'IA: Déconnecté");
  }

  async getSession(): Promise<vscode.AuthenticationSession | undefined> {
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
    } catch {
      return undefined;
    }
  }

  async ensureAuthenticated(): Promise<boolean> {
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

  async getAccessToken(): Promise<string | undefined> {
    const session = await this.getSession();
    return session?.accessToken;
  }

  isSignedIn(): boolean {
    return this.session !== undefined;
  }

  getAccountName(): string | undefined {
    return this.session?.account.label;
  }
}
