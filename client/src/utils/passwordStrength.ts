import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnRuPackage from '@zxcvbn-ts/language-ru';

export interface PasswordStrength {
  className: 'strength-weak' | 'strength-medium' | 'strength-strong';
  label: string;
  hint: string;
  width: string;
}

// Готовый анализатор zxcvbn с русскими словарями и подсказками
const zxcvbn = new ZxcvbnFactory({
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnRuPackage.dictionary
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnRuPackage.translations
});

export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;

  const result = zxcvbn.check(password);

  // score: 0 — совсем плохой, 4 — очень надёжный
  let className: PasswordStrength['className'];
  let label: string;

  if (result.score >= 3) {
    className = 'strength-strong';
    label = 'Надёжный пароль';
  } else if (result.score === 2) {
    className = 'strength-medium';
    label = 'Средний пароль';
  } else {
    className = 'strength-weak';
    label = 'Слабый пароль';
  }

  const hint = result.feedback.warning || result.feedback.suggestions[0] || '';

  return {
    className,
    label,
    hint,
    width: `${(result.score + 1) * 20}%`
  };
}
