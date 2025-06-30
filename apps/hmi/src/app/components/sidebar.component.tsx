import { EditRounded, PrecisionManufacturingRounded } from '@mui/icons-material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import Box from '@mui/joy/Box'
import Divider from '@mui/joy/Divider'
import GlobalStyles from '@mui/joy/GlobalStyles'
import IconButton from '@mui/joy/IconButton'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton'
import ListItemContent from '@mui/joy/ListItemContent'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import * as React from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { StyleContainer } from '../app.types'
import { http } from '../core/http.core'
import { EditProfileForm } from '../features/auth/edit-profile-form.component'
import { useCurrentUser } from '../hooks/use-current-user.hook'
import { ModalForm } from './modal-form.component'
import QrCode2Icon from '@mui/icons-material/QrCode2';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

type RenderToggleOptions = {
	open: boolean
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

type RenderToggle = (options: RenderToggleOptions) => React.ReactNode

type TogglerProps = {
	defaultExpanded?: boolean
	children: React.ReactNode
	renderToggle: RenderToggle
}

function Toggler({ defaultExpanded = false, renderToggle, children }: TogglerProps) {
	const [open, setOpen] = useState(defaultExpanded)

	return (
		<React.Fragment>
			{renderToggle({ open, setOpen })}
			<Box
				sx={{
					display: 'grid',
					gridTemplateRows: open ? '1fr' : '0fr',
					transition: '0.2s ease',
					'& > *': {
						overflow: 'hidden',
					},
				}}
			>
				{children}
			</Box>
		</React.Fragment>
	)
}

type SidebarMenuItem = {
	key: string
	path?: string
	label: string
	icon?: React.ReactNode
	exact?: boolean
	expandable?: boolean
	children?: SidebarMenuItem[]
}

const SidebarMenuItems: SidebarMenuItem[] = [
	{ key: 'home', path: '/', exact: true, label: 'Dashboard', icon: <DashboardRoundedIcon /> },
	{
		key: 'assembly',
		expandable: true,
		label: 'Manufacturing product list',
		icon: <PrecisionManufacturingRounded />,
		children: [
			{ key: 'stators', path: '/stators', label: 'Stators' },
			{ key: 'rotors', path: '/rotors', label: 'Subsystem Flanges' },
			{ key: 'motors', path: '/motors', label: 'Motors' },
			{ key: 'espe', path: '/espe', label: 'Clipper-Motor Assemblies' },
		],
	},
]

const SidebarMenuItemsPublic: SidebarMenuItem[] = [
	{ key: 'productAcquisition', path: '/product', exact: true, label: 'Product Certification', icon: <QrCode2Icon /> },
	{ key: 'productList', path: '/list', exact: true, label: 'Products Certificate List', icon: <FormatListBulletedIcon /> }
]

export function NavigationItem({ item }: { item: SidebarMenuItem }) {
	const navigate = useNavigate()
	const location = useLocation()

	function handleNavigate(event: React.MouseEvent<HTMLAnchorElement>) {
		const href = event.currentTarget.dataset.href!
		navigate(href)
	}

	if (item.expandable) {
		return (
			<ListItem nested>
				<Toggler
					renderToggle={({ open, setOpen }) => (
						<ListItemButton onClick={() => setOpen((o) => !o)}>
							{item.icon}
							<ListItemContent>
								<Typography level="title-sm">{item.label}</Typography>
							</ListItemContent>
							<KeyboardArrowDownIcon sx={{ transform: open ? 'rotate(180deg)' : 'none' }} />
						</ListItemButton>
					)}
				>
					<List sx={{ gap: 0.5 }}>
						{item.children?.map((child: any) => (
							<ListItem key={child.key} sx={{ mt: 0.5 }}>
								<ListItemButton
									data-href={child.path}
									onClick={handleNavigate}
									selected={location.pathname.includes(child.path!)}
								>
									{child.label}
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</Toggler>
			</ListItem>
		)
	}

	if (item.exact) {
		return (
			<ListItem>
				<ListItemButton
					selected={location.pathname === item.path}
					data-href={item.path}
					onClick={handleNavigate}
				>
					{item.icon}
					<ListItemContent>
						<Typography level="title-sm">{item.label}</Typography>
					</ListItemContent>
				</ListItemButton>
			</ListItem>
		)
	}

	return (
		<ListItem sx={{ mt: 0.5 }}>
			<ListItemButton
				data-href={item.path}
				selected={location.pathname.includes(item.path!)}
				onClick={handleNavigate}
			>
				{item.label}
			</ListItemButton>
		</ListItem>
	)
}

export function Navigation({ items }: { items: SidebarMenuItem[] }) {
	return (
		<List
			size="sm"
			sx={{
				gap: 1,
				'--List-nestedInsetStart': '30px',
				'--ListItem-radius': (theme) => theme.vars.radius.sm,
			}}
		>
			{items.map((item) => (
				<NavigationItem key={item.key} item={item} />
			))}
		</List>
	)
}

export function Sidebar() {
	const [currentUser, onRefreshCurrentUser] = useCurrentUser()
	const [showEditProfileModal, setShowEditProfileModal] = useState(false)

	console.log(currentUser)
	
	async function handleLogout() {
		try {
			await http.post('/auth/logout')

			toast.success('Logged out successfully!')
			onRefreshCurrentUser()
		} catch (error) {
			console.log(error)
			toast.error('Logout failed, please try again.')
		}
	}

	function handleShowEditProfileModal() {
		setShowEditProfileModal(true)
	}

	async function handleHideEditProfileModal() {
		await onRefreshCurrentUser()
		setShowEditProfileModal(false)
	}

	return (
		<>
			<Sheet className="Sidebar" sx={LocalStyles.Sidebar}>
				<GlobalStyles
					styles={(theme) => ({
						':root': {
							'--Sidebar-width': '220px',
							[theme.breakpoints.up('lg')]: {
								'--Sidebar-width': '240px',
							},
						},
					})}
				/>
				<Box
					className="Sidebar-overlay"
					sx={{
						position: 'fixed',
						zIndex: 9998,
						top: 0,
						left: 0,
						width: '100vw',
						height: '100vh',
						opacity: 'var(--SideNavigation-slideIn)',
						backgroundColor: 'var(--joy-palette-background-backdrop)',
						transition: 'opacity 0.4s',
						transform: {
							xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
							lg: 'translateX(-100%)',
						},
					}}
				/>
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center'}}>
					<img src="/brembo.svg" height={24} width={24} />
					<Typography level="title-lg" sx={{ color: '#e90000' }}>
						Brembochain
					</Typography>
				</Box>
				<Box
  					sx={{
    					position: 'relative',
    					minHeight: 0,
    					overflow: 'hidden auto',
    					flexGrow: 1,
    					display: 'flex',
    					flexDirection: 'column',
    					[`& .${listItemButtonClasses.root}`]: {
      						gap: 1.5,
    					},
    					'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							backgroundImage: 'url("login/Brembologo.png")',
							backgroundSize: '1000%', // Mantiene lo zoom
							backgroundRepeat: 'no-repeat',
							backgroundPosition: '4% 70%', // Mantiene il posizionamento
							opacity: 0.5, // Applica trasparenza SOLO sull'immagine
							zIndex: -1, // Posiziona lo sfondo dietro il contenuto
						},
					}}
				>
				{
					currentUser.profile.role != "customer" ? 
						<Navigation items={SidebarMenuItems} />:
						<Navigation items={SidebarMenuItemsPublic} />
				}
				</Box>
				<Divider />
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
					<IconButton variant="plain" color="neutral" size="sm" onClick={handleShowEditProfileModal}>
						<EditRounded />
					</IconButton>
					<Box sx={{ minWidth: 0, flex: 1 }}>
						<Typography level="body-xs">
							{currentUser.profile?.name} {currentUser.profile?.surname}
						</Typography>
						<Typography level="body-xs">{currentUser.login}</Typography>
					</Box>
					<IconButton size="sm" variant="plain" color="danger" onClick={handleLogout}>
						<LogoutRoundedIcon />
					</IconButton>
				</Box>
			</Sheet>
			<ModalForm
				title="Modifica Profilo"
				open={showEditProfileModal}
				onClose={handleHideEditProfileModal}
				formId="edit-profile-form"
			>
				<EditProfileForm
					profile={currentUser.profile}
					showControls={false}
					id="edit-profile-form"
					onSaved={handleHideEditProfileModal}
				/>
			</ModalForm>
		</>
	)
}

const LocalStyles: StyleContainer = {
	Sidebar: {
		position: {
			xs: 'fixed',
			md: 'fixed',
		},
		transform: {
			xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
			md: 'none',
		},
		transition: 'transform 0.4s, width 0.4s',
		zIndex: 1,
		height: '100dvh',
		width: 'var(--Sidebar-width)',
		top: 0,
		p: 2,
		flexShrink: 0,
		display: 'flex',
		flexDirection: 'column',
		gap: 2,
		borderRight: '1px solid',
		borderColor: 'divider',
	},
}
