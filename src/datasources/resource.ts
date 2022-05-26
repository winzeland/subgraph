import {
	ethereum,
	BigInt,
} from '@graphprotocol/graph-ts'

import {
	Account,
	ResourceContract,
	ResourceTransfer,
} from '../../generated/schema'

import {
	ApprovalForAll as ApprovalForAllEvent,
	AttributesUpdated,
	MetadataUpdated,
	TransferBatch  as TransferBatchEvent,
	TransferSingle as TransferSingleEvent,
	URI            as URIEvent,
} from '../../generated/resource/Resource'

import {
	constants,
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

import {
	fetchResource,
	fetchResourceToken,
	fetchResourceBalance,
	fetchResourceOperator,
	replaceURI,
} from '../fetch/resource'

function registerTransfer(
	event:    ethereum.Event,
	suffix:   string,
	contract: ResourceContract,
	operator: Account,
	from:     Account,
	to:       Account,
	id:       BigInt,
	value:    BigInt)
: void
{
	let token      = fetchResourceToken(contract, id)
	let ev         = new ResourceTransfer(events.id(event).concat(suffix))
	ev.emitter     = token.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
	ev.token       = token.id
	ev.operator    = operator.id
	ev.value       = decimals.toDecimals(value)
	ev.valueExact  = value

	if (from.id == constants.ADDRESS_ZERO) {
		let totalSupply        = fetchResourceBalance(token, null)
		totalSupply.valueExact = totalSupply.valueExact.plus(value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact)
		totalSupply.save()
	} else {
		let balance            = fetchResourceBalance(token, from)
		balance.valueExact     = balance.valueExact.minus(value)
		balance.value          = decimals.toDecimals(balance.valueExact)
		balance.save()

		ev.from                = from.id
		ev.fromBalance         = balance.id
	}

	if (to.id == constants.ADDRESS_ZERO) {
		let totalSupply        = fetchResourceBalance(token, null)
		totalSupply.valueExact = totalSupply.valueExact.minus(value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact)
		totalSupply.save()
	} else {
		let balance            = fetchResourceBalance(token, to)
		balance.valueExact     = balance.valueExact.plus(value)
		balance.value          = decimals.toDecimals(balance.valueExact)
		balance.save()

		ev.to                  = to.id
		ev.toBalance           = balance.id
	}

	token.save()
	ev.save()
}

export function handleTransferSingle(event: TransferSingleEvent): void
{
	let contract = fetchResource(event.address)
	let operator = fetchAccount(event.params.operator)
	let from     = fetchAccount(event.params.from)
	let to       = fetchAccount(event.params.to)

	registerTransfer(
		event,
		"",
		contract,
		operator,
		from,
		to,
		event.params.id,
		event.params.value
	)
}

export function handleTransferBatch(event: TransferBatchEvent): void
{
	let contract = fetchResource(event.address)
	let operator = fetchAccount(event.params.operator)
	let from     = fetchAccount(event.params.from)
	let to       = fetchAccount(event.params.to)

	let ids    = event.params.ids
	let values = event.params.values

	// If this equality doesn't hold (some devs actually don't follox the ERC specifications) then we just can't make
	// sens of what is happening. Don't try to make something out of stupid code, and just throw the event. This
	// contract doesn't follow the standard anyway.
	if(ids.length == values.length)
	{
		for (let i = 0;  i < ids.length; ++i)
		{
			registerTransfer(
				event,
				"/".concat(i.toString()),
				contract,
				operator,
				from,
				to,
				ids[i],
				values[i]
			)
		}
	}
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
	let contract         = fetchResource(event.address)
	let owner            = fetchAccount(event.params.account)
	let operator         = fetchAccount(event.params.operator)
	let delegation       = fetchResourceOperator(contract, owner, operator)
	delegation.approved  = event.params.approved
	delegation.save()
}

export function handleURI(event: URIEvent): void
{
	let contract = fetchResource(event.address)
	let token    = fetchResourceToken(contract, event.params.id)
	token.uri    = replaceURI(event.params.value, event.params.id)
	token.save()
}

export function handleMetadataUpdated(event: MetadataUpdated): void
{
	let contract 	= fetchResource(event.address)
	let token    	= fetchResourceToken(contract, event.params._id)
	token.name 	 	= event.params._metadata.name;
	token.type 	 	= event.params._metadata.typeId;
	token.subtype 	= event.params._metadata.subtypeId;
	token.save()
}

export function handleAttributesUpdated(event: AttributesUpdated): void
{
	let contract 	= fetchResource(event.address)
	let token    	= fetchResourceToken(contract, event.params._id)
	token.attr1type 	 	= event.params._attributes.attr1;
	token.attr1value 	 	= event.params._attributes.value1;
	token.attr2type 	 	= event.params._attributes.attr2;
	token.attr2value 	 	= event.params._attributes.value2;
	token.attr3type 	 	= event.params._attributes.attr3;
	token.attr3value 	 	= event.params._attributes.value3;
	token.attr4type 	 	= event.params._attributes.attr4;
	token.attr4value 	 	= event.params._attributes.value4;
	token.attr5type 	 	= event.params._attributes.attr5;
	token.attr5value 	 	= event.params._attributes.value5;
	token.attr6type 	 	= event.params._attributes.attr6;
	token.attr6value 	 	= event.params._attributes.value6;
	token.save()
}
