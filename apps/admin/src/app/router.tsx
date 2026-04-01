import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Demo4Layout } from '../layouts/demo4/layout';
import { routes } from './routes';

const router = createBrowserRouter([
  {
    element: <Demo4Layout />,
    children: routes,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
