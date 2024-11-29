import { createContext, useState,useContext } from "react";
import axios from 'axios';
import { useNavigate } from "react-router";
import httpStatus from 'http-status';
import server from "../environtment";

export const AuthContext=createContext({});

const client=axios.create({
    baseURL:`${server}/api/v1/users`
})

export const AuthProvider=({children})=>{
    const authContext=useContext(AuthContext);

    const [userData,setUserData]=useState(authContext);

    const router=useNavigate();

    const handleRegister=async(name,username,password)=>{
        try{
            let request=await client.post("/register/",{
                name:name,
                username:username,
                password:password
            })

            if(request.status===httpStatus.CREATED){
                return request.data.message;
            }
        }catch(err){
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            // Await the axios post request to ensure we get the resolved response.
            let request = await client.post('/login/', {
                username: username,
                password: password
            });
    
            console.log(request.data);
    
            // Check if the request status is 200 (OK).
            if (request.status === httpStatus.OK) {
                localStorage.setItem('token', request.data.token);
                router('/home'); // Navigate to the home page.
            }
        } catch (e) {
            // Handle errors properly and extract error messages.
            console.error('Login error:', e);
            let message = e.response?.data?.message || 'Login failed';
            throw new Error(message);
        }
    };
    
    const getHistoryOfUser=async()=>{
        try{
            let request=await client.get('/get_all_activity',{
                params:{
                    token:localStorage.getItem('token')
                }
            });
            return request.data;
        }catch(err){
            throw err;
        }
    }


    const addToHistoryOfUser=async(meetingCode)=>{
        try{
            let request=await client.post('/add_to_activity',{
               
                    token:localStorage.getItem('token'),
                    meeting_code:meetingCode,
                
            });
            return request;
        }catch(err){
            throw err;
        }
    }


    const data={
        userData,setUserData,addToHistoryOfUser,handleRegister,handleLogin,getHistoryOfUser
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}