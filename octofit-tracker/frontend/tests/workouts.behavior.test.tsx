import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import Workouts from '../src/components/Workouts.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('permite consultar sugestões de outra pessoa e informa falhas', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) =>
    String(input).includes('hubot')
      ? new Response('{}', { status: 404 })
      : new Response(JSON.stringify({ suggestions: [] }), { status: 200 })));
  const user = userEvent.setup();
  render(<Workouts />);
  const input = screen.getByLabelText(/e-mail da pessoa/i);
  await user.clear(input);
  await user.type(input, 'hubot@example.com');
  await user.click(screen.getByRole('button', { name: /buscar sugestões/i }));
  await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/workouts\/suggestions\/hubot%40example\.com$/)));
  await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
});
