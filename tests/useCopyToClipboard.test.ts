import writeText from 'copy-to-clipboard';
import { renderHook, act } from '@testing-library/react-hooks';
import { useCopyToClipboard } from '../src';

const valueToRaiseMockException = 'fake input causing exception in copy to clipboard';

jest.mock('copy-to-clipboard', () =>
  jest.fn().mockImplementation(input => {
    if (input === valueToRaiseMockException) {
      throw new Error(input);
    }
    return true;
  })
);

describe('useCopyToClipboard', () => {
  let hook;

  beforeEach(() => {
    hook = renderHook(() => useCopyToClipboard());
  });

  it('should be defined ', () => {
    expect(useCopyToClipboard).toBeDefined();
  });

  it('should pass a given value to copy to clipboard and set state', () => {
    const testValue = 'test';
    let [state, copyToClipboard] = hook.result.current;
    act(() => copyToClipboard(testValue));
    [state, copyToClipboard] = hook.result.current;

    expect(writeText).toBeCalled();
    expect(state.value).toBe(testValue);
    expect(state.noUserInteraction).toBe(true);
    expect(state.error).not.toBeDefined();
  });

  it('should only call writeText if passed a valid input and set state', () => {
    const testValue = {}; // invalid value
    let [state, copyToClipboard] = hook.result.current;
    act(() => copyToClipboard(testValue));
    [state, copyToClipboard] = hook.result.current;

    expect(writeText).not.toBeCalled();
    expect(state.value).toBe(testValue);
    expect(state.noUserInteraction).toBe(true);
    expect(state.error).toBeDefined();
  });

  it('should catch exception thrown by copy-to-clipboard and set state', () => {
    let [state, copyToClipboard] = hook.result.current;
    act(() => copyToClipboard(valueToRaiseMockException));
    [state, copyToClipboard] = hook.result.current;

    expect(writeText).toBeCalledWith(valueToRaiseMockException);
    expect(state.value).toBe(valueToRaiseMockException);
    expect(state.noUserInteraction).not.toBeDefined();
    expect(state.error).toStrictEqual(new Error(valueToRaiseMockException));
  });
  it('should return initial state while unmounted', () => {
    hook.unmount();
    const [state, copyToClipboard] = hook.result.current;

    act(() => copyToClipboard('value'));
    expect(state.value).not.toBeDefined();
    expect(state.error).not.toBeDefined();
    expect(state.noUserInteraction).toBe(true);
  });
});