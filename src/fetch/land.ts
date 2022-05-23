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
	LandContract,
	LandToken,
	LandProperties,
	LandOperator,
} from '../../generated/schema'

import {
	fetchAccount
} from './account'

import { Land } from '../../generated/Land/Land'

export function fetchLand(address: Address): LandContract | null {
	let erc721           = Land.bind(address)

	let account          = fetchAccount(address)
	let detectionId      = account.id.concat('/landDetection')
	let detectionAccount = Account.load(detectionId)

	if (detectionAccount == null) {
		detectionAccount = new Account(detectionId)
		let introspection_01ffc9a7 = supportsInterface(erc721, '01ffc9a7') // ERC165
		let introspection_80ac58cd = supportsInterface(erc721, '80ac58cd') // ERC721
		let introspection_00000000 = supportsInterface(erc721, '00000000', false)
		let isERC721               = introspection_01ffc9a7 && introspection_80ac58cd && introspection_00000000
		detectionAccount.asLand  = isERC721 ? account.id : null
		detectionAccount.save()
	}

	if (detectionAccount.asLand != null) {
		let contract = LandContract.load(account.id)

		if (contract == null) {
			contract                  = new LandContract(account.id)
			let try_name              = erc721.try_name()
			let try_symbol            = erc721.try_symbol()
			contract.name             = try_name.reverted   ? '' : try_name.value
			contract.symbol           = try_symbol.reverted ? '' : try_symbol.value
			contract.supportsMetadata = supportsInterface(erc721, '5b5e139f') // ERC721Metadata
			contract.asAccount        = account.id
			account.asLand            = account.id
			contract.save()
			account.save()
		}
		return contract as LandContract
	}

	return null;
}

export function fetchLandToken(contract: LandContract, identifier: BigInt): LandToken {
	let id = identifier.toHex();
	let token = LandToken.load(id)

	if (token == null) {
		token            = new LandToken(id)
		token.contract   = contract.id
		token.identifier = identifier
		token.approval   = fetchAccount(Address.fromString(constants.ADDRESS_ZERO)).id

		if (contract.supportsMetadata) {
			let erc721       = Land.bind(Address.fromString(contract.id))
			let try_tokenURI = erc721.try_tokenURI(identifier)
			token.uri        = try_tokenURI.reverted ? '' : try_tokenURI.value
		}
	}


	let properties = LandProperties.load(id);

	if (properties === null) {
		properties = new LandProperties(id);

		properties.token	= id;

		let erc721			= Land.bind(Address.fromString(contract.id))

		let try_properties	= erc721.try_properties(identifier);

		if (!try_properties.reverted) {
			const params 				= try_properties.value;
			properties.x 				= params.value0;
			properties.y 				= params.value1;
			properties.climate 			= params.value2;
			properties.landType 		= params.value3;
			properties.resource1 		= params.value4;
			properties.resource2 		= params.value5;
			properties.resource3 		= params.value6;
			properties.resource4 		= params.value7;
			properties.resourceLevel1 	= params.value8;
			properties.resourceLevel2 	= params.value9;
			properties.resourceLevel3 	= params.value10;
			properties.resourceLevel4 	= params.value11;
		}

		properties.save();
	}

	return token as LandToken
}

export function fetchLandOperator(contract: LandContract, owner: Account, operator: Account): LandOperator {
	let id = owner.id.concat('/').concat(operator.id)
	let op = LandOperator.load(id)

	if (op == null) {
		op          = new LandOperator(id)
		op.contract = contract.id
		op.owner    = owner.id
		op.operator = operator.id
	}

	return op as LandOperator
}
