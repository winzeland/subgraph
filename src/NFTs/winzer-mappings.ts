import { Transfer } from '../../generated/Winzer/Winzer'
import { Winzer } from '../../generated/schema'
import { fetchAccount } from '../fetch/account';

export function handleTransfer(event: Transfer): void {
  const user = fetchAccount(event.params.to);
  let land = new Winzer(event.params.tokenId.toString());
  land.account = user.id;
  land.save()
}
