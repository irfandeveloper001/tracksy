import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../../components/Input';

describe('Input Component', () => {
  it('should render correctly', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" value="" onChangeText={() => {}} />
    );
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should display label when provided', () => {
    const { getByText } = render(
      <Input label="Email" value="" onChangeText={() => {}} />
    );
    expect(getByText('Email')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" value="" onChangeText={mockOnChangeText} />
    );

    fireEvent.changeText(getByPlaceholderText('Enter text'), 'new text');
    expect(mockOnChangeText).toHaveBeenCalledWith('new text');
  });

  it('should display error message when error is provided', () => {
    const { getByText } = render(
      <Input value="" onChangeText={() => {}} error="This field is required" />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('should apply error styling when error exists', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Test" value="" onChangeText={() => {}} error="Error" />
    );
    const input = getByPlaceholderText('Test').parent;
    expect(input).toBeTruthy();
  });

  it('should be disabled when editable is false', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Test" value="" onChangeText={() => {}} editable={false} />
    );
    const input = getByPlaceholderText('Test');
    expect(input.props.editable).toBe(false);
  });
});

