import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/joy'
import { useAppSelector } from '../store/store'
import { isLoadingSelector } from '../store/loading.store'

export type ModalFormProps = {
	open: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
	formId: string
}

export function ModalForm({ open, onClose, title, formId, children }: ModalFormProps) {
	const loading = useAppSelector((state) => isLoadingSelector(state, `loading-${formId}`))

	return (
		<Modal open={open} onClose={onClose}>
			<ModalDialog>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent>{children}</DialogContent>
				<DialogActions>
					<Button type="submit" variant="soft" color="primary" form={formId} loading={loading}>
						Save
					</Button>
					<Button type="button" variant="soft" color="neutral" onClick={onClose} disabled={loading}>
						Cancel
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	)
}
