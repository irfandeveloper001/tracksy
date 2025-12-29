import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
  clearError,
} from '../../../store/slices/authSlice';

describe('Auth Reducer', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle loginStart', () => {
    const action = loginStart();
    const state = authReducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle loginSuccess', () => {
    const user = { id: 1, name: 'Test User', email: 'test@example.com' };
    const token = 'test-token';
    const refreshToken = 'refresh-token';

    const action = loginSuccess({ user, token, refreshToken });
    const state = authReducer(initialState, action);

    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.refreshToken).toBe(refreshToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should handle loginFailure', () => {
    const error = 'Invalid credentials';
    const action = loginFailure(error);
    const state = authReducer(initialState, action);

    expect(state.error).toBe(error);
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle logout', () => {
    const loggedInState = {
      ...initialState,
      user: { id: 1, name: 'Test' },
      token: 'token',
      isAuthenticated: true,
    };

    const action = logout();
    const state = authReducer(loggedInState, action);

    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.refreshToken).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle setUser', () => {
    const user = { id: 1, name: 'Test User' };
    const action = setUser(user);
    const state = authReducer(initialState, action);

    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error',
    };

    const action = clearError();
    const state = authReducer(stateWithError, action);

    expect(state.error).toBe(null);
  });
});

