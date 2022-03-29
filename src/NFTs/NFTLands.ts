import { Transfer } from '../../generated/NFTs/NFTLands'
import { Land } from '../../generated/schema'
import { createAndReturnUser } from './utils/UserUtils';

export function handleTransfer(event: Transfer): void {
  const user = createAndReturnUser(event.params.to);
  let land = new Land(event.params.tokenId.toString());
  land.user = user.id;
  land.save()
}
