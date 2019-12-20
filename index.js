// the tool that analysis this project require tree
// by halu886

const fs = require('fs')
const path =require('path')

const mapRequire = new Map()

async function DFS(currentPath,index){
    try {
        const state = fs.statSync(currentPath);

        if(state.isDirectory()&&path.basename(currentPath)!=="node_modules"){
            const res = fs.readdirSync(currentPath)
            for(child of res){
                await DFS(path.join(currentPath,child),index)
            }
            return false
        }

        // just analysis js file
        if(path.extname(currentPath)!=='.js'){
            return false
        }

        // torerant deap loop
        if(mapRequire.get(currentPath)){
            return false
        }

        console.log(index)
        if(index==0){
            console.log('{')
        }
        process.stdout.write(' '.repeat(index),path.relative(__dirname,currentPath))
        
        mapRequire.set(currentPath,true)

        const content = await fs.readFileSync(currentPath).toString('UTF-8');

        const requieSrc= content.match(/require\('(.*)'\)/g);

        if(!(requieSrc&&requieSrc.length)){
            return false
        }
        process.stdout.write(':[')
        for(requireMatch of requieSrc){
            const src = requireMatch.match(/'(.*)'/)[1];
            if(!path.basename(src)){
               path +='js' 
            }
            let nextPath ='';
            // console.error(src)
            if(fs.existsSync(path.join(currentPath,src))){
                nextPath=path.join(currentPath,src);
            }else if(fs.existsSync(path.join(__dirname+'/module',src))){
                nextPath=path.join(__dirname+'/module',src);
            }
            if(!nextPath){
                continue;
            }
            await DFS(nextPath,index+1)

       }
        mapRequire.set(currentPath,false)
        process.stdout.write(' '.repeat(index),']')
        if(index==0){
            console.log('}')
        }
        return true
    } catch (error) {
        console.log(error) 
        return false
    }
}
DFS(__dirname,0);