import { useState } from 'react'

export function useModalFormState(onBeforeClose?: any) {
	const [showModal, setShowModal] = useState(false)

	function handleShowModalForm() {
		setShowModal(true)
	}

	async function handleCloseModalForm() {
		await onBeforeClose?.()
		setShowModal(false)
	}

	return [showModal, { onOpen: handleShowModalForm, onClose: handleCloseModalForm }] as const
}
