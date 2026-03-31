import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';

export function SidebarHeader() {
  return (
    <div className="hidden lg:flex items-center justify-center shrink-0 pt-8 pb-3.5">
      <Link to="/">
        <img
          src={toAbsoluteUrl('/media/app/mini-logo-square-gray.svg')}
          className="dark:hidden min-h-[42px]"
          alt=""
        />
        <img
          src={toAbsoluteUrl('/media/app/mini-logo-square-gray-dark.svg')}
          className="hidden dark:block min-h-[42px]"
          alt=""
        />
      </Link>
    </div>
  );
}
