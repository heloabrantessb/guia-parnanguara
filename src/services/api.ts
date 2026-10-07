export async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_URL environment variable is not defined. Please configure it in .env'
    );
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${normalizedBase}${normalizedPath}`;

  const cabecalhos = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers: cabecalhos,
  });

  if (!response.ok) {
    let mensagemErro = `HTTP error ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`;
    try {
      const corpoErro = await response.json();
      if (corpoErro && typeof corpoErro.error === 'string') {
        mensagemErro = corpoErro.error;
      } else if (corpoErro && typeof corpoErro.message === 'string') {
        mensagemErro = corpoErro.message;
      }
    } catch {
      // Se a resposta nao for JSON, preserva a mensagem com o codigo HTTP
    }
    throw new Error(mensagemErro);
  }

  return (await response.json()) as T;
}
