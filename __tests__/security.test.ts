import {isPastedInput} from '../src/utils/security';

describe('isPastedInput', () => {
  it('allows typing and deleting one character at a time', () => {
    expect(isPastedInput('', 'a')).toBe(false);
    expect(isPastedInput('abc', 'abcd')).toBe(false);
    expect(isPastedInput('abcd', 'abXcd')).toBe(false);
    expect(isPastedInput('aa', 'aaa')).toBe(false);
    expect(isPastedInput('abcd', 'abc')).toBe(false);
    expect(isPastedInput('abcd', '')).toBe(false);
  });

  it('allows typing over a selection', () => {
    expect(isPastedInput('abcd', 'aXd')).toBe(false);
  });

  it('catches a paste into an empty or filled field', () => {
    expect(isPastedInput('', 'secret')).toBe(true);
    expect(isPastedInput('abc', 'abcxy')).toBe(true);
    expect(isPastedInput('abc', 'axyzbc')).toBe(true);
    expect(isPastedInput('aa', 'aaaa')).toBe(true);
  });

  it('catches a paste over a selection, even with no change in length', () => {
    expect(isPastedInput('abcd', 'wxyz')).toBe(true);
    expect(isPastedInput('abcd', 'xy')).toBe(true);
  });
});
