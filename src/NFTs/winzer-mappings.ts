import { Transfer } from '../../generated/Winzer/Winzer'
import { Winzer } from '../../generated/schema'
import { createAndReturnUser } from '../utils/user-utils';

export function handleTransfer(event: Transfer): void {
  const user = createAndReturnUser(event.params.to);
  let land = new Winzer(event.params.tokenId.toString());
  land.user = user.id;
  land.save()
}
