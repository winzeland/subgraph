import {
	Address,
} from '@graphprotocol/graph-ts'
import {
	constants,
} from '@amxx/graphprotocol-utils'

import {
	Account,
	GubbinsBalance,
	GubbinsContract,
} from '../../generated/schema'

import { Gubbins } from '../../generated/Gubbins/Gubbins'
import { fetchAccount } from './account'

export function fetchGubbins(address: Address): GubbinsContract {
	let account  = fetchAccount(address)
	let contract = GubbinsContract.load(account.id)

	if (contract == null) {
		let endpoint              = Gubbins.bind(address)
		let name                  = endpoint.try_name()
		let symbol                = endpoint.try_symbol()
		let decimals              = endpoint.try_decimals()
		contract                  = new GubbinsContract(account.id)

		// Common
		contract.name        = name.reverted     ? null : name.value
		contract.symbol      = symbol.reverted   ? null : symbol.value
		contract.decimals    = decimals.reverted ? 18   : decimals.value
		contract.totalSupply = fetchGubbinsBalance(contract, null).id
		contract.asAccount   = account.id
		account.asGubbins    = contract.id
		contract.save()
		account.save()
	}

	return contract as GubbinsContract
}

export function fetchGubbinsBalance(contract: GubbinsContract, account: Account | null): GubbinsBalance {
	let id      = account ? account.id : 'totalSupply';
	let balance = GubbinsBalance.load(id)

	if (balance == null) {
		balance                 = new GubbinsBalance(id)
		balance.contract        = contract.id
		balance.account         = account ? account.id : null
		balance.value           = constants.BIGDECIMAL_ZERO
		balance.valueExact      = constants.BIGINT_ZERO
		balance.save()
	}

	return balance as GubbinsBalance
}

// export function fetchGubbinsApproval(contract: GubbinsContract, owner: Account, spender: Account): ERC20Approval {
// 	let id       = contract.id.concat('/').concat(owner.id).concat('/').concat(spender.id)
// 	let approval = ERC20Approval.load(id)

// 	if (approval == null) {
// 		approval                = new ERC20Approval(id)
// 		approval.contract       = contract.id
// 		approval.owner          = owner.id
// 		approval.spender        = spender.id
// 		approval.value          = constants.BIGDECIMAL_ZERO
// 		approval.valueExact     = constants.BIGINT_ZERO
// 	}

// 	return approval as ERC20Approval
// }
