import { FormControl, FormLabel, Input, Button, Tooltip, Typography, Box, Chip } from '@mui/joy'
import { http } from '../../core/http.core'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '../../store/store'
import { addLoader, isLoadingSelector, removeLoader } from '../../store/loading.store'
import { InfoRounded } from '@mui/icons-material'

export type Profile = {
	name: string
	surname: string
	role: string
}

type EditProfileFormProps = {
	profile: Profile
	showControls?: boolean
	id?: string
	onSaved?: (profile: Profile) => void
}

function colorDecision(role: string){
	switch(role){
		case "admin": {
			return "success";
		}
		case "manager": {
			return "primary";
		}
		case "user": {
			return "danger";
		}
		case "customer": {
			return "neutral";
		}
	}
}

export function EditProfileForm({ profile, showControls = true, id, onSaved }: EditProfileFormProps) {
	const dispatch = useAppDispatch()
	const loading = useAppSelector((state) => isLoadingSelector(state, `loading-${id}`))
	
	async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const fd = new FormData(event.currentTarget)
		try {
			dispatch(addLoader(`loading-${id}`))
			const { data } = await http.post<Profile>('/users/me', Object.fromEntries(fd.entries()))

			toast.success('Profile saved!')
			onSaved?.(data)
		} catch (error) {
			console.log(error)
			toast.error('Cannot save profile, please try again.')
		} finally {
			dispatch(removeLoader(`loading-${id}`))
		}
	}


	return (
		<form onSubmit={handleSaveProfile} id={id}>
			<FormControl sx={{ mt: 1 }}>
				<FormLabel>Role</FormLabel>
					<Typography variant='soft' color={colorDecision(profile.role)} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
					{profile.role}
						<Tooltip 
							placement="right-end"
							variant="outlined"
							arrow
							title={
								<Box
          							sx={{
            						display: 'flex',
									flexDirection: 'column',
									maxWidth: 400,
									justifyContent: 'center',
									p: 3,
								}}>
									<Typography sx={{ fontWeight: 'lg', fontSize: 'lg', textAlign: "center" }}>
                						User Role Information
             	 					</Typography>
									<Chip size="md" color="success" sx={{ mt: 2, display: 'block', whiteSpace: 'normal', p:2}}>
                						<Typography sx={{fontWeight: 'lg'}}>Admin: </Typography> Can create new Clipper-Motor components and finalize them on the Blockchain, see the status of each part in production, check XML files, and download their contents
              						</Chip>
									<Chip size="md" color="primary" sx={{ mt: 2, display: 'block', whiteSpace: 'normal', p:2}}>
                						<Typography sx={{fontWeight: 'lg'}}>Manager: </Typography> Can see the status of each part in production, check XML files and download their contents
              						</Chip>
									<Chip size="md" color="danger" sx={{ mt: 2, display: 'block', whiteSpace: 'normal', p:2}}>
                						<Typography sx={{fontWeight: 'lg'}}>User: </Typography> Can see the status of each part in production and download its contents
              						</Chip>
									<Chip size="md" color="neutral" sx={{ mt: 2, display: 'block', whiteSpace: 'normal', p:2}}>
                						<Typography sx={{fontWeight: 'lg'}}>Customer: </Typography> Can request brake ownership on the Blockchain by entering the passkey received with the product
              						</Chip>
								</Box>
							}>
								<InfoRounded sx={{ marginLeft: 'auto', cursor: 'pointer' }}/>
						</Tooltip>
					</Typography>
			</FormControl>
			<FormControl sx={{ mt: 2 }}>
				<FormLabel>Name</FormLabel>
				<Input type="text" name="name" defaultValue={profile.name} />
			</FormControl>
			<FormControl sx={{ mt: 2 }}>
				<FormLabel>Surname</FormLabel>
				<Input type="text" name="surname" defaultValue={profile.surname} />
			</FormControl>
			{showControls && (
				<Button fullWidth sx={{ mt: 4 }} type="submit" loading={loading}>
					Save
				</Button>
			)}
		</form>
	)
}
