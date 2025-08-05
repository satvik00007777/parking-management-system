export const errorMiddleware=(err,req,res,next)=>{
    // console.log(err.statusCode);
    err.message ||="Internal Server Error";
    err.statusCode ||= 500;

    if(err.code===11000){
        err.message ="Duplicate Feild Error "+Object.keys(err.keyPattern).join(",");
        err.statusCode =400
    }

    if(err.name==="CastError"){
        err.message =`invalid format of ${err.path}`
        err.statusCode=400
    }

    return res.status(err.statusCode).json({
        errorMessage:err.message,
        success:false
    })

}