import { RouteObject } from 'react-router-dom';
import { BrandedLayout } from './layouts/branded';
import { ClassicLayout } from './layouts/classic';
import { ChangePasswordPage } from './pages/change-password-page';
import { ResetPasswordPage } from './pages/reset-password-page';
import { SignInPage } from './pages/signin-page';
import { SignUpPage } from './pages/signup-page';

// Define the auth routes
export const authRoutes: RouteObject[] = [
  {
    path: '',
    element: <BrandedLayout />,
    children: [
      {
        path: 'signin',
        element: <SignInPage />,
      },
      {
        path: 'signup',
        element: <SignUpPage />,
      },
      {
        path: 'change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: '',
    element: <ClassicLayout />,
    children: [
      {
        path: 'classic/signin',
        element: <SignInPage />,
      },
      {
        path: 'classic/signup',
        element: <SignUpPage />,
      },
      {
        path: 'classic/change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: 'classic/reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
];
