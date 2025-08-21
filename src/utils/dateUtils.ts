
/**
 * Cria uma data como local para evitar problemas de timezone
 */
export const createLocalDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Se já está no formato YYYY-MM-DD, verifica se é válida
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(dateStr + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      return dateStr; // Já está no formato correto
    }
  }
  
  // Tenta diferentes formatos de data
  let date: Date;
  
  // Formato DD/MM/YYYY ou DD-MM-YYYY
  const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  // Formato YYYY/MM/DD ou YYYY-MM-DD
  else if (dateStr.match(/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/)) {
    date = new Date(dateStr + 'T00:00:00');
  }
  // ISO format
  else if (dateStr.includes('T')) {
    date = new Date(dateStr.split('T')[0] + 'T00:00:00');
  }
  // Fallback - tenta criar data diretamente
  else {
    date = new Date(dateStr + 'T00:00:00');
  }
  
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
};

/**
 * Formata data para input do tipo date
 */
export const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Se já está no formato YYYY-MM-DD correto, retorna como está
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(dateStr + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      return dateStr;
    }
  }
  
  // Converte para o formato correto
  return createLocalDate(dateStr);
};

/**
 * Converte data do banco (que pode vir em ISO ou outros formatos) para formato de input
 */
export const formatDatabaseDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Remove timezone info se presente e pega apenas a parte da data
  const cleanDateStr = dateStr.split('T')[0];
  
  // Se já está no formato YYYY-MM-DD, verifica se é válida
  if (cleanDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(cleanDateStr + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      return cleanDateStr;
    }
  }
  
  return createLocalDate(cleanDateStr);
};
