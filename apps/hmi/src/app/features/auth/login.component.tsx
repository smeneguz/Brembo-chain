import { Button, FormControl, Input, Stack, Typography, Card, Grid, IconButton} from '@mui/joy'
import { Person, Visibility, VisibilityOff } from '@mui/icons-material'
import { Main } from '../../components/main.component'
import { http } from '../../core/http.core'
import { toast } from 'sonner'
import { useCurrentUser } from '../../hooks/use-current-user.hook'
import { Navigate } from 'react-router-dom'
import { useState } from 'react'

export function Login() {
	const [currentUser, onRefreshCurrentUser] = useCurrentUser()
	const [visiblePassword, setVisiblePassword] = useState(false)

	async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const fd = new FormData(event.currentTarget)

		try {
			await http.post('/auth/login', Object.fromEntries(fd.entries()))
			onRefreshCurrentUser()

			toast.success('Welcome!')
		} catch (error) {
			console.log(error)
			toast.error('Login failed, please verify your credentials and try again.')
		}
	}

	function VisibilityPassword(){
		return(
			<IconButton onClick={()=>setVisiblePassword(!visiblePassword)} sx={{mr: 0.1, width: "150%"}}>
				{visiblePassword ?
				<Visibility ></Visibility>
				:
				<VisibilityOff ></VisibilityOff>
			}
			</IconButton>
		)
	}


	if(currentUser){
		if (currentUser.profile.role != "customer") {
		return <Navigate to="/" />
	}

	if (currentUser.profile.role == "customer") {
		return <Navigate to="/product" />
	}
	}
	

	return (
		<div style={{
			backgroundImage: `url("login/brembowheel.jpg")`,
			backgroundSize: "cover", // Adatta l'immagine per coprire tutta l'area
			backgroundRepeat: "no-repeat", // Evita che l'immagine si ripeta
			backgroundPosition: "center", // Centra l'immagine
			height: "100vh", // Fa sì che il div occupi tutta la schermata
			width: "100%"
		  }}>
		<Main>
				
			<Grid container
      			justifyContent="center"
      			alignItems="center"
      			style={{ height: '100vh' }}>
					
			<Card sx={{width: '40%', mb: 20, mt: 35, backgroundColor: "rgba(255, 255, 255, 0.7)"}} variant='outlined' >
			<div style={{ display: 'flex', justifyContent: 'center' }}>
  					<img src='./login/Brembologo.png' style={{ width: '25%' }} />
				</div>
				<Typography level="title-lg" textAlign={"center"}>Blockchain powered by {' '}<img src='./login/linkslogo.png' width={"5%"} style={{verticalAlign: 'middle'}}/></Typography>
				
				<form onSubmit={handleLogin}>
					<FormControl required sx={{ mt: 4 }}>
						<Input type="email" placeholder='E-mail' name="login" endDecorator={<Person sx={{width: "150%", mr: 4}}></Person>} sx={{height: '50px'}}/>
					</FormControl>
					<FormControl required sx={{ mt: 2 }}>
						<Input placeholder='Password' type={!visiblePassword ? "password" : "text"}name="password" endDecorator={<VisibilityPassword />} sx={{height: '50px'}}/>
					</FormControl>
					<Stack gap={4} sx={{ mt: 5 }}>
						<Button type="submit" fullWidth>
							Login
						</Button>
					</Stack>
				</form>
			</Card>
			</Grid>
		
		</Main>
		</div>
	)
}
