import {
  collect,
  maxTextLength,
  minTextLength,
  nonNegativeNumber,
  requiredText,
} from './validation';

describe('validation', () => {
  test('requiredText игнорирует пробелы', () => {
    expect(requiredText('')).toBe('Заполните поле');
    expect(requiredText('   ')).toBe('Заполните поле');
    expect(requiredText('ok')).toBeUndefined();
    expect(requiredText('', 'Своё сообщение')).toBe('Своё сообщение');
  });

  test('minTextLength и maxTextLength считают без крайних пробелов', () => {
    expect(minTextLength(' ab ', 3, 'мало')).toBe('мало');
    expect(minTextLength(' abc ', 3, 'мало')).toBeUndefined();
    expect(maxTextLength('abcd', 3, 'много')).toBe('много');
    expect(maxTextLength('abc', 3, 'много')).toBeUndefined();
  });

  test('nonNegativeNumber', () => {
    expect(nonNegativeNumber(0)).toBeUndefined();
    expect(nonNegativeNumber(10)).toBeUndefined();
    expect(nonNegativeNumber(-1)).toBe('Значение не может быть меньше 0');
    expect(nonNegativeNumber(Number.NaN)).toBe('Значение не может быть меньше 0');
  });

  test('collect выбрасывает пустые ошибки', () => {
    expect(collect({ a: undefined, b: '', c: 'Ошибка' })).toEqual({ c: 'Ошибка' });
    expect(collect({ a: undefined })).toEqual({});
  });
});
