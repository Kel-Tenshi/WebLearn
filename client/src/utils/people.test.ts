import { displayPerson } from './people';

describe('displayPerson', () => {
  test('предпочитает ФИО', () => {
    expect(displayPerson('Иванов Иван Иванович', 'manager')).toBe('Иванов Иван Иванович');
  });

  test('откатывается к логину или исходному тексту', () => {
    expect(displayPerson(null, 'manager')).toBe('manager');
    expect(displayPerson(undefined, 'АО ЛабСервис')).toBe('АО ЛабСервис');
  });

  test('пустые значения дают прочерк', () => {
    expect(displayPerson(null, null)).toBe('—');
    expect(displayPerson('', '')).toBe('—');
  });
});
