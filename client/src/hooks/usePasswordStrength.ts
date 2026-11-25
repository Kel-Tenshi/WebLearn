import { useEffect, useRef, useState } from 'react';
import { getPasswordStrength } from '../utils/passwordStrength';
import type { PasswordStrength } from '../utils/passwordStrength';

// Проверка zxcvbn синхронная и заметно «тяжёлая»: на быстром вводе она
// блокировала бы интерфейс на каждом символе. Поэтому запускаем её только
// после паузы в наборе и показываем состояние «проверяем».
export const PASSWORD_STRENGTH_DELAY = 400;

export interface PasswordStrengthState {
  strength: PasswordStrength | null;
  /** Ввод изменился, но проверка ещё не выполнена — регистрация заблокирована. */
  pending: boolean;
}

export function usePasswordStrength(
  password: string,
  delay: number = PASSWORD_STRENGTH_DELAY
): PasswordStrengthState {
  const [state, setState] = useState<PasswordStrengthState>({
    strength: null,
    pending: false,
  });

  // Предыдущий результат нужен, чтобы не мигала шкала во время паузы.
  const lastStrength = useRef<PasswordStrength | null>(null);

  useEffect(() => {
    if (!password) {
      lastStrength.current = null;
      setState({ strength: null, pending: false });
      return;
    }

    setState({ strength: lastStrength.current, pending: true });

    let computeTimer: number | undefined;

    const debounceTimer = window.setTimeout(() => {
      // Даём браузеру отрисовать индикатор до тяжёлого расчёта.
      computeTimer = window.setTimeout(() => {
        const strength = getPasswordStrength(password);
        lastStrength.current = strength;
        setState({ strength, pending: false });
      }, 0);
    }, delay);

    return () => {
      window.clearTimeout(debounceTimer);
      if (computeTimer !== undefined) window.clearTimeout(computeTimer);
    };
  }, [password, delay]);

  return state;
}
