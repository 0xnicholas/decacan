import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { BrandedLayout } from '../auth/layouts/branded';

describe('BrandedLayout', () => {
  it('presents Console wording in the branded auth panel', () => {
    render(
      <MemoryRouter>
        <BrandedLayout />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Console Access' })).toBeInTheDocument();
    expect(screen.getByText('A secure authentication gateway for the Console experience.')).toBeInTheDocument();
  });
});
