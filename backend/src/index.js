import dotenv from 'dotenv';
dotenv.config();
import express, { urlencoded } from 'express';
import {createServer} from 'node:http';
import mongoose from 'mongoose';
import router from './routes/users.routes.js';
import cors from 'cors';
import { connectToSocket } from './controllers/socketManager.js';

const app=express();
const MONGO_URL=process.env.MONGO_URL;
const server=createServer(app);
const io=connectToSocket(server);

app.set("port",(process.env.PORT||8080));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({extended:true,limit:"40kb"}));
app.use('/api/v1/users',router);

const start=async()=>{

    mongoose.connect(process.env.MONGO_URL)
      .then(() => console.log('DB connected'))
      .catch((err) => console.log('DB connection error:', err));
    

server.listen(app.get("port"),()=>{
    console.log(`App is listening to Port ${8080}`);
})
}

start();
