export declare function getDaemonEnv(): NodeJS.ProcessEnv & {
    NX_PROJECT_GLOB_CACHE: string;
    NX_CACHE_PROJECTS_CONFIG: string;
};
/**
 * Env for spawning the daemon process. On top of the reflected env, it must
 * keep excluded vars the daemon needs to start correctly:
 * - ELECTRON_RUN_AS_NODE (matched by the ELECTRON_ prefix exclusion): when
 *   the spawning client runs inside an Electron host, process.execPath is
 *   the Electron binary and only this var makes it run the daemon's Node
 *   entry point.
 * - NX_WORKSPACE_ROOT_PATH: the daemon resolves its workspace root at
 *   startup by walking up from cwd looking for workspace markers; without
 *   the pin, a root without markers under an ancestor that has them
 *   resolves to the ancestor and the daemon publishes its socket under the
 *   wrong workspace.
 */
export declare function getDaemonSpawnEnv(): NodeJS.ProcessEnv & {
    NX_PROJECT_GLOB_CACHE: string;
    NX_CACHE_PROJECTS_CONFIG: string;
};
/**
 * Without the deletion step, a var set by one client (e.g.
 * `NX_PREFER_NODE_STRIP_TYPES=true` or `JAVA_TOOL_OPTIONS=...` for a single
 * command) would persist in the daemon and leak into every subsequent
 * client's project-graph computation. Deletion skips excluded vars and
 * required settings, which the daemon owns and clients should not control.
 */
export declare function applyDaemonEnvFromClient(newEnv: NodeJS.ProcessEnv): string[];
