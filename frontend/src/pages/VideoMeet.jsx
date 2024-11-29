import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from '../styles/videoComponent.module.css';
import TextField from '@mui/material/TextField';
import { Badge, Button, Icon, IconButton } from '@mui/material';
import server from '../environtment.js';
import io from 'socket.io-client';
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VoiceOverOffIcon from '@mui/icons-material/VoiceOverOff';
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
//localStream
const server_url=server;
let connections={};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
    
};

function VideoMeet() {
    //videoRef

    let socketRef=useRef();
    let socketIdRef=useRef();
    let localVideoRef=useRef();
    let playBackVideoRef=useRef(null);

    let [recording,setRecording]=useState(false);

    let [videoAvailable,setVideoAvailable]=useState(true);

    let [audioAvailable,setAudioAvailable]=useState(true);

    let [recorder,setRecorder]=useState(null);

    let [recordedChunks,setRecordedChunks]=useState([]);

     let [video,setVideo]=useState();

    let [username,setUserName]=useState('');

    let [audio,setAudio]=useState();

    let [screen,setScreen]=useState();

    let [showModal,setshowModal]=useState(true);

    let [screenAvailable,setScreenAvailable]=useState();

    let [message,setMessage]=useState('');

    let [messages,setMessages]=useState([]);

    let [newMessages,setNewMessages]=useState(3);

    let [askForUserName,setAskForUserName]=useState(true);
    
    const videoRef=useRef([]);

    let [videos,setVideos]=useState([]);


    useEffect(()=>{
        getPermissions();
    },[]);

    let getDisplayMedia=()=>{
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
                .then(getDisplayMediaSuccess).then((stream)=>{}).catch((e)=>console.log(e));
            }
        }
    }

    const getPermissions=async()=>{
        try{
            const videoPermission=await navigator.mediaDevices.getUserMedia({
                video:true,
            });
            if(videoPermission){
                setVideoAvailable(true);
                console.log('Video permission granted');
            }else{
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission=await navigator.mediaDevices.getUserMedia({
                audio:true,
            });
            if(audioPermission){
                setAudioAvailable(true);
                console.log('Audio permission granted');
            }else{
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            
            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }


if(videoAvailable||audioAvailable){
    const userMediaStream=await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});

    if(userMediaStream){
        window.localStream=userMediaStream;
        if(localVideoRef.current){
            localVideoRef.current.srcObject=userMediaStream;
        }
    }
}
// console.log("Permissions - Video:", videoAvailable, "Audio:", audioAvailable);

        }catch(err){
            console.log(err);
        }
    };

    useEffect(()=>{
        if(video!==undefined&&audio!==undefined){
            getUserMedia();
        }
    },[audio,video]);

    //getMedia

    let getMedia=()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
         console.log("Media acquired successfully");
        connectToSocketserver();
    }

    let getUserMediaSuccess=(stream)=>{
try{
    window.localStream.getTracks().forEach(track=>track.stop());
}catch(e){
    console.log(e);
}
window.localStream=stream;
localVideoRef.current.srcObject=stream;

// // let localChunks=[];
// console.log(stream.getTracks());
// let constraints={audio:audioAvailable,video:videoAvailable};
// // let recordedChunks=[];
// navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
//     const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
//     mediaRecorder.ondataavailable = (event) => {
//         console.log("ondataavailable fired, chunk size:", event.data.size);
//         if (event.data.size > 0) {
//             recordedChunks.push(event.data);
//         }
    // };    
    // setRecorder(mediaRecorder);
    
    // Handle what happens when recording stops
//     mediaRecorder.onstop = () => {
//         console.log("Final recorded chunks:", recordedChunks);
//         const blob = new Blob(recordedChunks, { type: "video/webm" });
//         console.log("Blob size:", blob.size);

//         // Example: Assign the blob to a video element for playback
//        /* const videoURL = URL.createObjectURL(blob);
//         document.querySelector("video").src = videoURL;
//         const downloadURL=URL.createObjectURL(blob);
//         const a=document.createElement('a');
//         a.href=downloadURL;
//         a.download="recording.webm";
//         a.click();
//         URL.revokeObjectURL(downloadURL);*/
//     };

//     // Start recording
//     setRecorder(mediaRecorder);
//     mediaRecorder.start();

//     // // Example: Stop recording after 5 seconds
//     // setTimeout(() => {
//     //     mediaRecorder.stop();
//     // }, 5000);
// }).catch((e)=>{
//     console.log(e);
// })

for(let id in connections){
    if(id===socketIdRef.current) continue;

    connections[id].addStream(window.localStream);

    connections[id].createOffer().then((description)=>{
        connections[id].setLocalDescription(description)
        .then(()=>{
            socketRef.current.emit('signal',id,JSON.stringify({'sdp':connections[id].localDescription}))
        }).catch(e=>console.log(e));
    })
}
stream.getTracks().forEach((track)=>track.onended=()=>{
    setVideo(false);
    setAudio(false);

    try{
        let tracks=localVideoRef.current.srcObject.getTracks()
        tracks.forEach((track)=>{
            track.stop()
        })
    }catch(e){
        console.log(e);
    }

    //blacksilence
    let blacksilence=(...args)=>new MediaStream([black(...args),silence()]);
    window.localStream=blacksilence();
    localVideoRef.current.srcObject=window.localStream;

    for(let id in connections){
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description)=>{
            connections[id].setLocalDescription(description).then(()=>{
                socketRef.current.emit('signal',id,JSON.stringify({'sdp':connections[id].localDescription}));
            })
        })
    }
})
    }


    let getUserMedia=()=>{
        if((video&&videoAvailable)||(audio&&audioAvailable)){
            navigator.mediaDevices.getUserMedia({video:video,audio:audio}).then(getUserMediaSuccess).then((stream)=>{}).catch((e)=>console.log(e));
        }else{
            try{
                let tracks=localVideoRef.current.srcObject.getTracks();
                tracks.forEach((track)=>track.stop());
            }catch(e){
                console.log(e);
        }
        }
    }




    let getDisplayMediaSuccess=(stream)=>{
        console.log("HERE");
        try{
            window.localStream.getTracks().forEach(track=>track.stop());
        }catch(e){console.log(e);}

        window.localStream=stream;
        localVideoRef.current.srcObject=stream;

        for(let id in connections){
            if(id===socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description)=>{
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit('signal',id,JSON.stringify({'sdp':connections[id].localDescription}))
                })
                .catch(e=>console.log(e));
            })
        }
        stream.getTracks().forEach(track=>track.onended=()=>{
            setScreen(false);

            try{
                let tracks=localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track=>track.stop())
            }catch(e){
                console.log(e);
            }

            let blackSilence=(...args)=>new MediaStream([black(...args),silence()])
            window.localStream=blackSilence()
            localVideoRef.current.srcObject=window.localStream;

            getUserMedia();
        })
    }


let gotMessageFromServer=(fromId,message)=>{
    let signal=JSON.parse(message);
        if(fromId!==socketIdRef.current){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
                    if(signal.sdp.type==='offer'){
                        connections[fromId].createAnswer().then((description)=>{
                            connections[fromId].setLocalDescription(description).then(()=>{
                                socketRef.current.emit('signal',fromId,JSON.stringify({'sdp':connections[fromId].localDescription}))
                            }).catch(e=>console.log(e));
                        }).catch(e=>console.log(e));
                    }
                }).catch(e=>console.log(e));
            }
        if(signal.ice){
    connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e=>console.log(e));
}
        }
    }


    let connectToSocketserver=()=>{
        socketRef.current=io.connect(server_url,{secure:false});

        socketRef.current.on('signal',gotMessageFromServer);

        socketRef.current.on('connect',()=>{

            socketRef.current.emit('join-call',window.location.href)

            socketIdRef.current=socketRef.current.id;

            socketRef.current.on('chat-message',addMessage);

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => {
                    const updatedVideos = videos.filter((video) => video.socketId !== id);
                    videoRef.current = updatedVideos;
                    return updatedVideos;
                });
            
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            });
            

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    if (!connections[socketListId]) {
                        connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
            
                        // Handle ICE candidates
                        connections[socketListId].onicecandidate = (event) => {
                            if (event.candidate) {
                                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                            }
                        };
            
                        // Handle new streams
                        connections[socketListId].ontrack = (event) => {
                            let videoExists = videoRef.current.find(video => video.socketId === socketListId);
                            const [remoteStream] = event.streams;
            
                            if (videoExists) {
                                // Update the existing video
                                setVideos((videos) => {
                                    const updatedVideos = videos.map((video) =>
                                        video.socketId === socketListId
                                            ? { ...video, stream: remoteStream }
                                            : video
                                    );
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            } else {
                                // Add a new video
                                let newVideo = {
                                    socketId: socketListId,
                                    autoPlay: true,
                                    stream: remoteStream,
                                    playsinline: true,
                                };
                                setVideos((videos) => {
                                    const updatedVideos = [...videos, newVideo];
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            }
                        };
            
                        // Add local stream to the new connection if available
                        if (window.localStream) {
                            window.localStream.getTracks().forEach((track) => {
                                connections[socketListId].addTrack(track, window.localStream);
                            });
                        }
                    }
                });
            
                // Create offers for all existing connections except self
                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
            
                        connections[id2].createOffer()
                            .then((description) => {
                                return connections[id2].setLocalDescription(description);
                            })
                            .then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                            })
                            .catch((e) => console.error("Offer creation error: ", e));
                    }
                }
            });
            
        })
    }



    let silence=()=>{
        let ctx=new AudioContext()
        let oscillator=ctx.createOscillator();

        let dst=oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false});
    }

    let black=({width=640,height=480}={})=>{
let canvas=Object.assign(document.createElement('canvas'),{width,height});
canvas.getContext('2d').fillRect(0,0,width,height);
let stream=canvas.captureStream();
return Object.assign(stream.getVideoTracks()[0],{enabled:false});
    }



    useEffect(() => {
        console.log("Videos array updated in useEffect:", videos);
    }, [videos]);
    
    const handleVideo = () => {
        if (video) {
            // Turn off the video stream
            localVideoRef.current.srcObject.getTracks().forEach(track => {
                if (track.kind === 'video') track.enabled = false;
            });
        } else {
            // Turn on the video stream
            localVideoRef.current.srcObject.getTracks().forEach(track => {
                if (track.kind === 'video') track.enabled = true;
            });
        }
        setVideo(!video);
    };



    
    // useEffect(() => {
    //     console.log("Recorded chunks updated:", recordedChunks);
    // }, [recordedChunks]);

    // const stopRecordingCallBack = async() => {
    //     if (localVideoRef.current) {
    //         if (recordedChunks.length > 0) {
    //             const recordedBlob = new Blob(recordedChunks, { type:"video/webm" });
    //             console.log("Recorded Blob:", recordedBlob);
    //         console.log("Blob size:", recordedBlob.size);
    //         localVideoRef.current.srcObject = null;
    //         localVideoRef.current.src = URL.createObjectURL(recordedBlob);
    //         localVideoRef.current.controls = true;

    //         // const downloadLink=document.createElement('a');
    //         // downloadLink.href=URL.createObjectURL(recordedBlob);
    //         // downloadLink.download='recording.webm';
    //         // downloadLink.textContent='Download recording';
    //         // downloadLink.style.display='block';
    //         // document.body.appendChild(downloadLink);
    //         } else {
    //             console.error("No recorded data available.");
    //         }
    //     }


    
    //     recorder.stream.getTracks().forEach((track) => track.stop());
    //     setRecorder(null);
    // };


   
// useEffect(() => {
//     if (localVideoRef.current && localVideoRef.current.srcObject) {
//         const stream = localVideoRef.current.srcObject;
//         const newRecorder = new MediaRecorder(stream);

//         setRecorder(newRecorder);

//         newRecorder.ondataavailable = (e) => {
//             setRecordedChunks((prevChunks) => [...prevChunks, e.data]);
//         };

//         newRecorder.onstop = stopRecordingCallBack;
//     }
// }, [localVideoRef.current?.srcObject]);  // Depend on stream change

    
    
//     const handleRecording = async() => {
//         if (!recorder || recorder.state === "inactive") {
//         const videoStream = localVideoRef.current.srcObject;
//         let combinedStream;

//         try {
//             const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            
//             // If screenStream is available, combine it with the videoStream
//             combinedStream = new MediaStream([
//                 ...videoStream.getTracks(),
//                 ...screenStream.getTracks()
//             ]);
//         } catch (e) {
//             console.error("Error starting screen sharing:", e);
//             // If screenStream is not available, just use the videoStream
//             combinedStream = new MediaStream([...videoStream.getTracks()]);
//         }
// // Initialize with current stream

// const mediaRecorder = new MediaRecorder(combinedStream);
//             let chunks = [];

//             mediaRecorder.ondataavailable = (event) => {
//                 if (event.data.size > 0) {
//                     chunks.push(event.data);
//                 }
//             };

//             mediaRecorder.onstop = () => {
//                 console.log("Recording stopped");
//                 if (chunks.length > 0) {
//                     // Process recorded chunks (e.g., create a video blob)
//                     const recordedBlob = new Blob(chunks, { type: 'video/webm' });
//                     const videoURL = URL.createObjectURL(recordedBlob);//afterwards
//                     // document.querySelector("video").src = videoURL;
//                     // // Optionally, trigger a download
//                     // const downloadLink = document.createElement('a');
//                     // downloadLink.href = videoURL;
//                     // downloadLink.download = 'recording.webm';
//                     // downloadLink.click();
//                 }
//             };    
//             setRecorder(mediaRecorder);
//             mediaRecorder.start();
//             console.log("Recorder initialized and recording started.");
//         }
    
//         if (recorder.state === "inactive") {
//              setRecording(true);
//             recorder.start();
//             console.log("Recording started:", recorder);
           
//         } else if (recorder.state === "recording") {
//             setRecording(false);
//             recorder.stop();
//             console.log("Recorded chunks:", recordedChunks);
//             console.log("Recording stopped:", recorder);
            
//         } else {
//             console.warn("Unhandled recorder state:", recorder.state);
//         }
//     };
    
    
    
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])


    let handleScreen=()=>{
        setScreen(!screen);
    }

    let routeTo=useNavigate();

    let addMessage=(data,sender,socketIdSender)=>{
        setMessages((prevMessages)=>[
            ...prevMessages,{sender:sender,data:data}
        ]);

        if(socketIdSender!==socketIdRef.current){
            setNewMessages((prevNewMessages)=>prevNewMessages+1)
        }
    }


    let sendMessage = () => {
        console.log('Sending message:', message, 'from:', username);
        socketRef.current.emit('chat-message', message, username);
        setMessage('');
    };   


    let handleEndCall=()=>{
       try{
        let tracks=localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track=>track.stop());
       }catch(e){
       }

       routeTo('/home');
       window.location.reload();
    }
   

    let connect=()=>{
        console.log("Connecting...");
        setAskForUserName(false);
        console.log("askForUserName after update:", askForUserName);
        getMedia();
        console.log("Media requested");
    }
    return ( 
        <>
        <div>{askForUserName===true?<div>
        <h2>Enter into Lobby</h2>
        <TextField id="outlined-basic" label="Username"   variant="outlined" value={username} onChange={e=>setUserName(e.target.value)}/>
        <Button variant="contained" onClick={connect}>Connect</Button>
        <div>
            <video ref={localVideoRef} autoPlay muted></video>
        </div>
        </div>:<div className={styles.meetVideoContainer}>

           {showModal? <div className={styles.chatRoom}>
            <div className={styles.chatContainer}>
                <h1 style={{textAlign:'center'}}>Chats</h1>

                <div className={styles.chattingDisplay}>{messages.map((item,idx)=>{
                    return(
                        <div key={idx} style={{marginBottom:'15px'}}>
                            <p style={{fontWeight:'bold'}}>{item.sender}</p>
                            <p>{item.data}</p>
                        </div>
                    )
                })}
                </div>
                <div className={styles.chattingArea}>
                                <TextField value={message} onChange={(e)=>setMessage(e.target.value)}  id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                <Button variant='contained' onClick={sendMessage} className={styles.dangerBtn}>Send</Button>

                            </div>
</div>
            </div>:<></>}

            <div className={styles.buttonContainer}>
                <IconButton style={{color:'white'}} onClick={handleVideo}>
                    {(video===true)?<VideocamIcon/>:<VideocamOffIcon/>}
                </IconButton>
                <IconButton onClick={handleEndCall} style={{color:'red'}}>
                    <CallEndIcon/>
                </IconButton>
                <IconButton style={{color:'white'}} onClick={handleAudio}>
                    {audio===true?<MicIcon/>:<MicOffIcon/>}
                </IconButton>

                

                {screenAvailable==true?<IconButton onClick={handleScreen} style={{color:'white'}}>
                    {screen===true?<ScreenShareIcon/>:<StopScreenShareIcon/>}
                </IconButton>:<></>}

            

                <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton onClick={()=>setshowModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />                        </IconButton>
                        </Badge>

            </div>
            <video 
    className={styles.meetUserVideo} 
    ref={localVideoRef} 
    autoPlay 
    muted 
    style={{ display: video ? 'block' : 'none' }} 
></video>

     
       <div className={styles.conferenceView} >
       {videos.map((video) => (
    <div key={video.socketId}  >
    
        <video
    data-socket={video.socketId}
    ref={(ref) => {
        if (ref && video.stream) {
            ref.srcObject = video.stream;
            console.log("Stream assigned to video element:", video.stream);
        }
    }}
    autoPlay
    playsInline
/>

    </div>
))}
</div>
        </div>}</div>
        </>
     );
}

export default VideoMeet;