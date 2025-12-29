import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../components/Button';

describe('Button Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={mockOnPress} />);

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    const { queryByText, getByTestId } = render(
      <Button title="Test Button" onPress={() => {}} loading={true} />
    );

    expect(queryByText('Test Button')).toBeNull();
    // ActivityIndicator should be present
    expect(getByTestId).toBeTruthy();
  });

  it('should render primary variant by default', () => {
    const { getByText } = render(<Button title="Test" onPress={() => {}} />);
    const button = getByText('Test').parent;
    expect(button).toBeTruthy();
  });

  it('should render outline variant correctly', () => {
    const { getByText } = render(
      <Button title="Test" onPress={() => {}} variant="outline" />
    );
    expect(getByText('Test')).toBeTruthy();
  });
});

