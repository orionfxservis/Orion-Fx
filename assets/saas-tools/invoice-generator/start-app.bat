@echo off
title InvoiceCraft - Local Server
echo ========================================================
echo  Starting InvoiceCraft (Zero npm dependencies needed)
echo ========================================================
echo.
echo Opening http://localhost:8080 in your default browser...
start http://localhost:8080
echo.
echo Server running. Press Ctrl+C in this window to stop.
echo.
node -e "const http=require('http'),fs=require('fs'),path=require('path');const mime={'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};http.createServer((req,res)=>{let p='.'+decodeURI(req.url.split('?')[0]);if(p==='./')p='./index.html';fs.readFile(p,(err,data)=>{if(err){res.writeHead(404,{'Content-Type':'text/plain'});res.end('404 Not Found: '+p);}else{res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Access-Control-Allow-Origin':'*'});res.end(data);}});}).listen(8080);"
