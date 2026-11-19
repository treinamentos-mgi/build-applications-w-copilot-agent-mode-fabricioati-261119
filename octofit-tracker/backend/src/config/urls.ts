export const apiPort = Number(process.env.PORT ?? 8000);

export function apiBaseUrl() {
  // No Codespaces, a URL pública da API usa o domínio da porta encaminhada.
  return process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-8000.app.github.dev`
    : `http://localhost:${apiPort}`;
}
