import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { IndustryProvider } from '../app/providers/index';
import { ArtResourcesPage } from '../features/art-resources/short-drama/ArtResourcesPage';
import { ScriptPage } from '../features/script/short-drama/ScriptPage';
import { StoryboardPage } from '../features/storyboard/short-drama/StoryboardPage';

function renderDramaRoute(initialPath: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <IndustryProvider industryId="short-drama">
        <Routes>
          <Route path="/workspaces/:workspaceId/*" element={element} />
        </Routes>
      </IndustryProvider>
    </MemoryRouter>,
  );
}

describe('short drama pages', () => {
  it('renders the script page without runtime errors', async () => {
    renderDramaRoute('/workspaces/drama-team/script', <ScriptPage />);

    expect(await screen.findByRole('heading', { name: '剧本管理' })).toBeInTheDocument();
  });

  it('renders the storyboard page without runtime errors', async () => {
    renderDramaRoute('/workspaces/drama-team/storyboard', <StoryboardPage />);

    expect(await screen.findByRole('heading', { name: '分镜板' })).toBeInTheDocument();
  });

  it('renders the art resources page without runtime errors', async () => {
    renderDramaRoute('/workspaces/drama-team/art', <ArtResourcesPage />);

    expect(await screen.findByRole('heading', { name: '美术资源库' })).toBeInTheDocument();
  });
});
