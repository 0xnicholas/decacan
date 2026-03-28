# Decacan App Artifact Preview Drawer Design

## Goal

Upgrade artifact preview from an inline `<pre>` into an operation-first drawer that keeps users inside the task workstation while making result actions easier to understand.

## Scope

This design stays inside `/tasks/:taskId`. It does not add an artifact route or a separate artifact page.

In scope:
- right-side artifact preview drawer
- unified open behavior from the sidebar and artifact panel
- operation-first drawer header and actions
- loading, empty, and error states for preview content

Out of scope:
- dedicated artifact routes
- real file-open or download integration
- rich markdown rendering
- multi-artifact tabbing or diff views

## Drawer Structure

The drawer should appear as a right-side overlay above the task page.

Sections:
1. header
2. actions
3. body

### Header

The header should show:
- artifact label
- canonical path
- artifact status
- explicit close button

### Actions

The actions row should prioritize task-oriented operations:
- copy path
- refresh preview
- one reserved secondary slot for future `open` or `download`

### Body

The body renders the preview content:
- show text content when available
- show a loading state during fetch
- show a clear error message if fetch fails
- show an empty state when content is blank

## Interaction Model

Both the sidebar primary-artifact button and the artifact panel preview button should open the same drawer state in `TaskPage`.

`TaskPage` should own:
- selected artifact
- preview content
- preview loading state
- preview error state
- drawer open/close state

The page should not change routes when the drawer opens.

## Testing

Primary frontend checks:
- drawer opens from both artifact entry points
- drawer shows artifact metadata and actions
- refresh preview re-fetches content
- copy path is wired
- close returns focus to the task page context
- loading, error, and empty preview states render clearly
