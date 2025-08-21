
/**
 * Cria uma data como local para evitar problemas de timezone
 */
export const createLocalDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr + 'T00:00:00');
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
  
  // Se já está no formato YYYY-MM-DD, retorna como está
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  return createLocalDate(dateStr);
};
