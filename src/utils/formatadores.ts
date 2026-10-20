export function resolverUrlImagem(
  caminhoImagem?: string | null
): string | null {
  if (!caminhoImagem) {
    return null;
  }

  if (
    caminhoImagem.startsWith('http://') ||
    caminhoImagem.startsWith('https://')
  ) {
    return caminhoImagem;
  }

  const urlBase = process.env.EXPO_PUBLIC_API_URL || '';
  const baseSemBarraFinal = urlBase.endsWith('/')
    ? urlBase.slice(0, -1)
    : urlBase;

  // Remove sufixo de versao (/v1) se presente para obter a raiz do servidor de midia
  const hostServidor = baseSemBarraFinal.replace(/\/v1$/i, '');
  const caminhoNormalizado = caminhoImagem.startsWith('/')
    ? caminhoImagem
    : `/${caminhoImagem}`;

  return `${hostServidor}${caminhoNormalizado}`;
}

export function formatarHorario(horario?: string | null): string {
  if (!horario) {
    return '';
  }

  const partes = horario.split(':');
  if (partes.length >= 2) {
    return `${partes[0]}:${partes[1]}`;
  }

  return horario;
}

export function formatarValorEntrada(
  valor?: string | number | null
): string {
  if (valor === null || valor === undefined) {
    return 'Entrada gratuita';
  }

  const numero = typeof valor === 'number' ? valor : parseFloat(valor);
  if (isNaN(numero) || numero <= 0) {
    return 'Entrada gratuita';
  }

  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

export function formatarDataEvento(dataIso: string): string {
  try {
    const data = new Date(dataIso);
    if (isNaN(data.getTime())) {
      return dataIso;
    }

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    return `${dia}/${mes} às ${horas}:${minutos}`;
  } catch {
    return dataIso;
  }
}
