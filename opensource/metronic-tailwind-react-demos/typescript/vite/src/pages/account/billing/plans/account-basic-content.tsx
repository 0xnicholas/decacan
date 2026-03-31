import { Faq } from '@/partials/common/faq';
import { Help } from '@/partials/common/help';
import { Plans } from './components';

export function AccountPlansContent() {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Plans />
      <Faq />
      <Help />
    </div>
  );
}
