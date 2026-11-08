import { createApp } from './app.js';
import express from 'express';
import { resolve } from 'node:path';
const port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1';
const {app,db}=createApp({database:process.env.DATABASE_PATH,origin:process.env.APP_ORIGIN});
if(process.env.NODE_ENV==='production'){app.use(express.static(resolve('dist')));app.get('/{*path}',(_,res)=>res.sendFile(resolve('dist/index.html')));}else{const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
const server=app.listen(port,host,()=>console.log(`Дом мечты A1: http://${host}:${port}`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
