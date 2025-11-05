// Example component test
// Note: Requires Jest and React Native Testing Library

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrimaryButton from '../../components/buttons/PrimaryButton';

describe('PrimaryButton', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={() => {}} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={onPress} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={onPress} disabled={true} />
    );

    const button = getByText('Test Button').parent;
    expect(button?.props.accessibilityState.disabled).toBe(true);
  });

  it('should show loading state', () => {
    const { queryByText, getByTestId } = render(
      <PrimaryButton title="Test Button" onPress={() => {}} loading={true} />
    );

    expect(queryByText('Test Button')).toBeNull();
    // Assuming ActivityIndicator has testID
    // expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});

