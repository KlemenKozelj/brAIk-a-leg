import { render, screen, fireEvent } from '@testing-library/react';
import RouletteWheel from '@/components/RouletteWheel';

const mockLines = ['Line one', 'Line two', 'Line three', 'Line four'];
const mockEmotions = ['happy', 'sad', 'angry', 'calm'];

describe('RouletteWheel', () => {
  it('shows idle state initially', () => {
    render(
      <RouletteWheel
        lines={mockLines}
        emotions={mockEmotions}
        onSpin={jest.fn()}
        onComplete={jest.fn()}
        isActive={false}
        disabled={false}
      />
    );
    expect(screen.getByText(/Tap to spin/i)).toBeInTheDocument();
    expect(screen.getByText(/Spin the scene/i)).toBeInTheDocument();
  });

  it('calls onSpin when button is clicked', () => {
    const onSpin = jest.fn();
    render(
      <RouletteWheel
        lines={mockLines}
        emotions={mockEmotions}
        onSpin={onSpin}
        onComplete={jest.fn()}
        isActive={false}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByText(/Spin the scene/i));
    expect(onSpin).toHaveBeenCalled();
  });

  it('disables button when disabled prop is true', () => {
    render(
      <RouletteWheel
        lines={mockLines}
        emotions={mockEmotions}
        onSpin={jest.fn()}
        onComplete={jest.fn()}
        isActive={false}
        disabled={true}
      />
    );
    expect(screen.getByText(/Spin the scene/i)).toBeDisabled();
  });

  it('renders without crashing with active state', () => {
    render(
      <RouletteWheel
        lines={mockLines}
        emotions={mockEmotions}
        onSpin={jest.fn()}
        onComplete={jest.fn()}
        isActive={true}
        disabled={false}
      />
    );
    // In idle state, isActive doesn't change the displayed content
    expect(screen.getByText(/Tap to spin/i)).toBeInTheDocument();
  });
});
