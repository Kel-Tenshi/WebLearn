import { useMemo } from 'react';
import { getPasswordStrength } from '../utils/passwordStrength';

export function usePasswordStrength(password: string) {
  return useMemo(() => getPasswordStrength(password), [password]);
}
