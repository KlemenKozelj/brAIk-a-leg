import { render, screen } from '@testing-library/react';
import AccessGate from '@/components/AccessGate';

describe('AccessGate', () => {
  it('renders age and consent checkboxes', () => {
    render(<AccessGate onAccess={jest.fn()} />);
    expect(screen.getByText(/18 years/i)).toBeInTheDocument();
    expect(screen.getByText(/consent/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter the stage/i })).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    const onAccess = jest.fn();
    render(<AccessGate onAccess={onAccess} />);
    expect(screen.getByRole('button', { name: /enter the stage/i })).toBeInTheDocument();
  });
});
