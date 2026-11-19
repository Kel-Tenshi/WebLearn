// Единое правило отображения людей: ФИО, если удалось разрешить логин,
// иначе исходное значение (логин, название организации или комиссии).
export function displayPerson(
  fullName?: string | null,
  fallback?: string | null
): string {
  return fullName || fallback || '—';
}
