import  React, { useState ,useContext} from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {
  
    const [username,setUserName]=useState();
    const [formState,setFormState]=useState(0);
    const [password,setPassword]=useState();
    const [name,setName]=useState();
    const [error,setError]=useState();
    const [message,setMessage]=useState();
    const [open,setOpen]=useState(false);

    const {handleRegister,handleLogin}=useContext(AuthContext)

    let handleAuth=async()=>{
      const handleLoginSubmit = async () => {
        try {
            let result = await handleLogin(username, password);
            setMessage(result);
            setOpen(true);
        } catch (e) {
            let message = e.response?.data?.message || 'Login failed';
            setError(message);
        }
    };
    
    const handleRegisterSubmit = async () => {
        try {
            let result = await handleRegister(name, username, password);
            console.log(result);
            setMessage(result);
            setOpen(true);
            setError('');
            setFormState(0);
            setUserName('');
            setPassword('');
        } catch (e) {
            let message = e.response?.data?.message || 'Registration failed';
            setError(message);
        }
    };    
    if(formState===0){
      handleLoginSubmit()
    }
    if(formState===1){
      handleRegisterSubmit()
    }
    }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
  item
  xs={false}
  sm={4}
  md={7}
  sx={{
    backgroundRepeat: 'no-repeat',
    backgroundColor: (t) =>
      t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
  style={{
    backgroundImage: `url(https://source.unsplash.com/random?wallpapers)`,
  }}
/>
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <div>
                <Button variant={formState===0?'contained':""} onClick={()=>setFormState(0)}>
                    Sign In
                </Button>
                <Button  variant={formState===1?'contained':""} onClick={()=>setFormState(1)}>
                    Sign Up
                </Button>
            </div>
            <Box component="form" noValidate  sx={{ mt: 1 }}>
                {formState===1?<TextField
                margin="normal"
                required
                fullWidth
                id="fullname"
                label="Full name"
                name="fullname"
                autoFocus
                onChange={(e)=>setName(e.target.value)}
              />:<></>}
            
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus
                onChange={(e)=>setUserName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                value={password}
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e)=>setPassword(e.target.value)}
              />
              <p style={{color:'red'}}>{error}</p>
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
               {formState===0?'Sign In':'Register'} 
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
             
            </Box>
          </Box>
        </Grid>
      </Grid>

{message?
      <Snackbar open={open}
      autoHideDuration={4000}
      message={message}/>:<></>}
    </ThemeProvider>
  );
}