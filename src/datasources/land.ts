import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	LandTransfer,
	WinzerTransfer,
} from '../../generated/schema'

import {
	Approval       as ApprovalEvent,
	ApprovalForAll as ApprovalForAllEvent,
	Transfer       as TransferEvent,
} from '../../generated/Land/Land'

import {
	fetchAccount,
} from '../fetch/account'

import { fetchLand, fetchLandOperator, fetchLandToken } from '../fetch/land'

export function handleTransfer(event: TransferEvent): void {
	let contract = fetchLand(event.address)
	if (contract != null) {
		let token = fetchLandToken(contract, event.params.tokenId)
		let from  = fetchAccount(event.params.from)
		let to    = fetchAccount(event.params.to)

		token.owner = to.id

		contract.save()
		token.save()

		let ev         = new LandTransfer(events.id(event))
		ev.emitter     = contract.id
		ev.transaction = transactions.log(event).id
		ev.timestamp   = event.block.timestamp
		ev.contract    = contract.id
		ev.token       = token.id
		ev.from        = from.id
		ev.to          = to.id
		ev.save()
	}
}

export function handleApproval(event: ApprovalEvent): void {
	let contract = fetchLand(event.address)
	if (contract != null) {
		let token    = fetchLandToken(contract, event.params.tokenId)
		let owner    = fetchAccount(event.params.owner)
		let approved = fetchAccount(event.params.approved)

		token.owner    = owner.id
		token.approval = approved.id

		token.save()
		owner.save()
		approved.save()

		// let ev = new Approval(events.id(event))
		// ev.emitter     = contract.id
		// ev.transaction = transactions.log(event).id
		// ev.timestamp   = event.block.timestamp
		// ev.token       = token.id
		// ev.owner       = owner.id
		// ev.approved    = approved.id
		// ev.save()
	}
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
	let contract = fetchLand(event.address)
	if (contract != null) {
		let owner      = fetchAccount(event.params.owner)
		let operator   = fetchAccount(event.params.operator)
		let delegation = fetchLandOperator(contract, owner, operator)

		delegation.approved = event.params.approved

		delegation.save()

		// 	let ev = new ApprovalForAll(events.id(event))
		// 	ev.emitter     = contract.id
		// 	ev.transaction = transactions.log(event).id
		// 	ev.timestamp   = event.block.timestamp
		// 	ev.delegation  = delegation.id
		// 	ev.owner       = owner.id
		// 	ev.operator    = operator.id
		// 	ev.approved    = event.params.approved
		// 	ev.save()
	}
}
