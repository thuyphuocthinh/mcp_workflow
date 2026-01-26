import { render, screen, waitFor } from '@testing-library/react';
import { Tooltip } from '@/components/ui/tooltip';
import { Provider } from '@/components/ui/provider';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('Tooltip Component', () => {
  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup();

    render(
      <Provider>
        <Tooltip content="Helper text">
          <button>Hover me</button>
        </Tooltip>
      </Provider>,
    );

    const trigger = screen.getByRole('button', { name: /hover me/i });

    // Tooltip shouldn't be visible initially in the document
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();

    // Hover over the trigger
    await user.hover(trigger);

    // Wait for the tooltip to appear in the document
    await waitFor(() => {
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });
  });
});
