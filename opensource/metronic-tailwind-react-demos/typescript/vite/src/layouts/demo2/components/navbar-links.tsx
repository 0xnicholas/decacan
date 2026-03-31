export function NavbarLinks() {
  return (
    <div className="flex items-center text-sm gap-5 lg:pb-1">
      <a
        className="hover:text-primary"
        href="https://www.youtube.com/c/KeenThemesTuts/videos"
      >
        Videos
      </a>
      <a
        className="hover:text-primary"
        href="https://keenthemes.com/metronic/tailwind/docs/"
      >
        User Guides
      </a>
      <a className="hover:text-primary" href="https://devs.keenthemes.com">
        Support
      </a>
    </div>
  );
}
