import { Transfer } from '../../generated/Land/NFTLands'
import { Land } from '../../generated/schema'
import { fetchAccount } from '../fetch/account';

export function handleTransfer(event: Transfer): void {
  const user = fetchAccount(event.params.to);
  let land = new Land(event.params.tokenId.toString());
  land.account = user.id;
  land.save()
}
