// the tool that analysis this project require tree
// by halu886

const parsePath = require('./core').module
const path = require('path')

const args = process.argv.slice(2);

if(!(args&&args.length)){
    console.log('...input analysis relative dir/file path')
    return
}

process.stdout.on("error",(e)=>{
    console.error(e)
})

console.time('requireAnalize')
const fs =require('fs')
parsePath(path.join(__dirname,args[0]),0,path.join(__dirname,args[0])).then(res=>{
    // console.log(JSON.stringify(res,null,5))
    console.timeEnd('requireAnalize')
    // fs.writeFileSync('./output.json',JSON.stringify(res,null,5))
}).catch(e=>console.error);