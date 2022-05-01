import {
	Address,
	BigInt,
} from '@graphprotocol/graph-ts'
import {
	constants,
} from '@amxx/graphprotocol-utils'

import {
	supportsInterface,
} from '@openzeppelin/subgraphs/src/fetch/erc165'

import {
	Account,
	WinzerToken,
	WinzerContract,
	WinzerOperator,
} from '../../generated/schema'

import {
	fetchAccount
} from './account'
import { Winzer } from '../../generated/Winzer/Winzer'

export function fetchWinzer(address: Address): WinzerContract | null {
	let erc721           = Winzer.bind(address)

	let account          = fetchAccount(address)
	let detectionId      = account.id.concat('/winzerDetection')
	let detectionAccount = Account.load(detectionId)

	if (detectionAccount == null) {
		detectionAccount = new Account(detectionId)
		let introspection_01ffc9a7 = supportsInterface(erc721, '01ffc9a7') // ERC165
		let introspection_80ac58cd = supportsInterface(erc721, '80ac58cd') // ERC721
		let introspection_00000000 = supportsInterface(erc721, '00000000', false)
		let isERC721               = introspection_01ffc9a7 && introspection_80ac58cd && introspection_00000000
		detectionAccount.asWinzer  = isERC721 ? account.id : null
		detectionAccount.save()
	}

	if (detectionAccount.asWinzer != null) {
		let contract = WinzerContract.load(account.id)

		if (contract == null) {
			contract                  = new WinzerContract(account.id)
			let try_name              = erc721.try_name()
			let try_symbol            = erc721.try_symbol()
			contract.name             = try_name.reverted   ? '' : try_name.value
			contract.symbol           = try_symbol.reverted ? '' : try_symbol.value
			contract.supportsMetadata = supportsInterface(erc721, '5b5e139f') // ERC721Metadata
			contract.asAccount        = account.id
			account.asWinzer          = account.id
			contract.save()
			account.save()
		}
		return contract as WinzerContract
	}

	return null;
}

export function fetchWinzerToken(contract: WinzerContract, identifier: BigInt): WinzerToken {
	let id = identifier.toHex();
	let token = WinzerToken.load(id)

	if (token == null) {
		token            = new WinzerToken(id)
		token.contract   = contract.id
		token.identifier = identifier
		token.approval   = fetchAccount(Address.fromString(constants.ADDRESS_ZERO)).id

		if (contract.supportsMetadata) {
			let erc721       = Winzer.bind(Address.fromString(contract.id))
			let try_tokenURI = erc721.try_tokenURI(identifier)
			token.uri        = try_tokenURI.reverted ? '' : try_tokenURI.value
		}
	}

	return token as WinzerToken
}

export function fetchWinzerOperator(contract: WinzerContract, owner: Account, operator: Account): WinzerOperator {
	let id = owner.id.concat('/').concat(operator.id)
	let op = WinzerOperator.load(id)

	if (op == null) {
		op          = new WinzerOperator(id)
		op.contract = contract.id
		op.owner    = owner.id
		op.operator = operator.id
	}

	return op as WinzerOperator
}
