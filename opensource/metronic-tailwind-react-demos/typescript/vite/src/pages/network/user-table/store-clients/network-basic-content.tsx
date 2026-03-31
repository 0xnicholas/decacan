import { Faq } from '@/partials/common/faq';
import { Help2 } from '@/partials/common/help2';
import { StoreClients } from './components';

export function NetworkStoreClientsContent() {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <StoreClients />
      <Faq />
      <Help2 />
    </div>
  );
}
