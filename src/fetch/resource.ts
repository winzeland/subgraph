import {
	Address,
	BigInt,
} from '@graphprotocol/graph-ts'

import {
	Account,
	ResourceContract,
	ResourceToken,
	ResourceBalance,
	ResourceOperator,
} from '../../generated/schema'

import {
	Resource,
} from '../../generated/resource/Resource'

import {
	constants,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

export function replaceURI(uri: string, identifier: BigInt): string {
	return uri.replaceAll(
		'{id}',
		identifier.toHex().slice(2).padStart(64, '0'),
	)
}

export function fetchResource(address: Address): ResourceContract {
	let account        = fetchAccount(address)
	let contract       = new ResourceContract(account.id)
	contract.asAccount = account.id
	account.asResource  = contract.id
	contract.save()
	account.save()

	return contract
}

export function fetchResourceToken(contract: ResourceContract, identifier: BigInt): ResourceToken {
	let id = identifier.toHex()
	let token = ResourceToken.load(id)

	if (token == null) {
		let erc1155            = Resource.bind(Address.fromString(contract.id))
		let try_uri            = erc1155.try_uri(identifier)
		token                  = new ResourceToken(id)
		token.contract         = contract.id
		token.identifier       = identifier
		token.totalSupply      = fetchResourceBalance(token as ResourceToken, null).id
		token.uri              = try_uri.reverted ? null : replaceURI(try_uri.value, identifier)
		token.save()
	}

	return token as ResourceToken
}

export function fetchResourceBalance(token: ResourceToken, account: Account | null): ResourceBalance {
	let id = token.id.concat('/').concat(account ? account.id : 'totalSupply')
	let balance = ResourceBalance.load(id)

	if (balance == null) {
		balance            = new ResourceBalance(id)
		balance.contract   = token.contract
		balance.token      = token.id
		balance.account    = account ? account.id : null
		balance.value      = constants.BIGDECIMAL_ZERO
		balance.valueExact = constants.BIGINT_ZERO
		balance.save()
	}

	return balance as ResourceBalance
}

export function fetchResourceOperator(contract: ResourceContract, owner: Account, operator: Account): ResourceOperator {
	let id = owner.id.concat('/').concat(operator.id)
	let op = ResourceOperator.load(id)

	if (op == null) {
		op          = new ResourceOperator(id)
		op.contract = contract.id
		op.owner    = owner.id
		op.operator = operator.id
	}

	return op as ResourceOperator
}
