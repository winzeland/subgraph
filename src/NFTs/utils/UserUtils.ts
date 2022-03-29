import { Address, BigInt } from '@graphprotocol/graph-ts';
import { User } from '../../../generated/schema';

export function createAndReturnUser(address: Address): User {
  let user = User.load(address.toHex());

  if (user == null) {
    user = new User(address.toHex());
    // user.firstSeenAt = BigInt.fromI64(Date.now() / 1000);
  }

  // user.lastSeenAt = BigInt.fromI64(Date.now() / 1000);

  user.save();
  return user;
}
