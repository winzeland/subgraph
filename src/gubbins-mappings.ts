import { Transfer } from '../generated/Gubbins/Gubbins';
import { createAndReturnUser } from './utils/user-utils';

export function handleTransfer(event: Transfer): void {
  const sender = createAndReturnUser(event.params.from);
  sender.gubbins = sender.gubbins.minus(event.params.value);
  sender.save();

  const receiver = createAndReturnUser(event.params.to);
  receiver.gubbins = receiver.gubbins.plus(event.params.value);
  receiver.save();
}
