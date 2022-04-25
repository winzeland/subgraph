import { Transfer } from '../generated/Gubbins/Gubbins';
import { fetchAccount } from './fetch/account';

export function handleTransfer(event: Transfer): void {
  const sender = fetchAccount(event.params.from);
  sender.gubbins = sender.gubbins.minus(event.params.value);
  sender.save();

  const receiver = fetchAccount(event.params.to);
  receiver.gubbins = receiver.gubbins.plus(event.params.value);
  receiver.save();
}
