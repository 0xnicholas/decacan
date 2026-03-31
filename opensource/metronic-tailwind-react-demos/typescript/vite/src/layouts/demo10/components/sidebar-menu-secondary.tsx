import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';

const items = [
  {
    logo: 'x-dark.svg',
    title: '@keenthemes',
    path: 'https://keenthemes.com/metronic/tailwind/docs/',
  },
  {
    logo: 'slack.svg',
    title: '@keenthemes_hub',
    path: 'https://github.com/keenthemes/',
  },
  {
    logo: 'figma.svg',
    title: 'metronic',
    path: 'https://keenthemes.com/metronic/tailwind/docs/',
  },
];

export function SidebarMenuSecondary() {
  return (
    <div>
      <h3 className="text-xs text-muted-foreground uppercase ps-5 inline-block mb-3">
        Outline
      </h3>
      <div className="flex flex-col w-full gap-1.5 px-3.5">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="group flex items-center gap-2.5 py-1 px-1"
          >
            <span className="bg-black rounded-md flex items-center justify-center size-7">
              <img
                src={toAbsoluteUrl(`/media/brand-logos/${item.logo}`)}
                className="size-3.5"
                alt={item.title}
              />
            </span>
            <span className="text-sm text-secondary-foreground group-hover:text-mono">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
