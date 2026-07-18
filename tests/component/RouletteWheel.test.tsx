import { render, screen, fireEvent } from '@testing-library/react';
import RouletteWheel from '@/components/RouletteWheel';

const lines = ['Line one', 'Line two', 'Line three', 'Line four'];
const emotions = ['happy', 'sad', 'angry', 'calm'];

describe('RouletteWheel', () => {
  it('shows idle state initially', () => {
    render(<RouletteWheel lines={lines} emotions={emotions} onSpin={jest.fn()} onComplete={jest.fn()} disabled={false} />);
    expect(screen.getByText(/Tap to spin/i)).toBeInTheDocument();
    expect(screen.getByText(/Spin the scene/i)).toBeInTheDocument();
  });

  it('calls onSpin on click', () => {
    const onSpin = jest.fn();
    render(<RouletteWheel lines={lines} emotions={emotions} onSpin={onSpin} onComplete={jest.fn()} disabled={false} />);
    fireEvent.click(screen.getByText(/Spin the scene/i));
    expect(onSpin).toHaveBeenCalled();
  });

  it('disables button when disabled', () => {
    render(<RouletteWheel lines={lines} emotions={emotions} onSpin={jest.fn()} onComplete={jest.fn()} disabled={true} />);
    expect(screen.getByText(/Spin the scene/i)).toBeDisabled();
  });
});
