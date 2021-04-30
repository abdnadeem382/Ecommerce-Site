const app = require('./app');
const dotenv =  require('dotenv');
const connectDatabase = require('./config/database');

process.on('uncaughtException', err=>{
    console.log(`ERROR: ${err.message}`);
    console.log("Shutting down server due to uncaught exception");
    process.exit(1);
});

dotenv.config({path:'config/config.env'});

//connect to mongodb
connectDatabase();

const server =app.listen(process.env.PORT, ()=>{
    console.log(`Server started on port:  ${process.env.PORT} in ${process.env.NODE_ENV} mode`)
})

//handle promise rejections
process.on('unhandledRejection', err=>{
    console.log(`ERROR: ${err.message}`);
    console.log(`Shutting down server`);
    server.close(()=>{
        process.exit(1);
    })
})