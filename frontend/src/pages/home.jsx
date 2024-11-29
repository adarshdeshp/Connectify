import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router';
import '../App.css';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
function HOME() {

    const [meetingCode,setMeetingCode]=useState('');
    const {addToHistoryOfUser}=useContext(AuthContext);

    let navigate=useNavigate();

    let handleVideoCall=async()=>{
        await addToHistoryOfUser(meetingCode);
        navigate(`/${meetingCode}`);
    }
    return ( 
        <>
        <div className="navbar">
            <div style={{display:'flex',alignItems:'center'}}>
                <h2>Connectify</h2>
            </div>
            <div style={{display:'flex',alignItems:'center'}}>
<IconButton onClick={()=>{navigate('/history')}}>
    <RestoreIcon/>
</IconButton >
<p>History</p>
<Button style={{marginLeft:'1rem'}} onClick={()=>{localStorage.removeItem('token');
    navigate('/');
}}>
    Logout
</Button>
            </div>
        </div>

        <div className="meetContainer">
            <div className="leftPanel">
                <div>
                    <h2 style={{marginBottom:'1rem'}}>Providing Quality Video Call Just Like Quality Education.</h2>
                    <div style={{display:'flex',gap:'10px'}}>
                    <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                    <Button onClick={handleVideoCall} variant='contained'>Join</Button>
                    </div>
                </div>
            </div>
            <div className="rightPanel">
                <img src='/logo3.png.png'/>
            </div>
        </div>
        </>
     );
}

export default withAuth(HOME);