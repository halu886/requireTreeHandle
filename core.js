// base on recursion backtracking 
// halu886
const fs = require('fs')
const path =require('path')


function validPath(p,mapRequire){

    // just analysis js file
    if(path.extname(p)!=='.js'){
        return false
    }

    // torerant deap loop
    if(mapRequire.get(p)){
        return false
    }

    return true
}

async function analysisRequire(currentPath,index,__projectDir,mapRequire){

        if(!validPath(currentPath,mapRequire)){
            return;
        }

        const content = await fs.readFileSync(currentPath).toString('UTF-8');

        const requieSrc= content.match(/require\('(.*)'\)/g);

        if(!(requieSrc&&requieSrc.length)){
            return false
        }
        const currentDirname = path.dirname(currentPath)
        for(requireMatch of requieSrc){
            let src = requireMatch.match(/'(.*)'/)[1];
            const parseSrc = path.parse(src);
            const fileName = src.split('.').shift();
            if(fs.existsSync(path.join(currentDirname,fileName+'.js'))){
                src =path.join(currentDirname,fileName+'.js');
            }else if(fs.existsSync(path.join(__projectDir+'/module',fileName+'.js'))){
                src =path.join(__projectDir+'/module',fileName+'.js');
            }else if(fs.existsSync(path.join(__projectDir,'/module',fileName,parseSrc.name+'.js'))){
                src = path.join(__projectDir,'/module',fileName,parseSrc.name+'.js');
            }
            if(!fs.existsSync(src)){
                continue;
            }
            mapRequire.set(path.relative(__projectDir,src),true)
            await analysisRequire(src,1+index,__projectDir,mapRequire)
       }
}

async function parsePath(currentPath,index,__projectDir){
    try {
        const state = fs.statSync(currentPath);

        let dirSrc={};
        if(state.isDirectory()&&path.basename(currentPath)!=="node_modules"){
            const res = fs.readdirSync(currentPath)
            for(const child of res){
                const pathObj = await parsePath(path.join(currentPath,child),index,__projectDir)
                dirSrc = {...dirSrc,...pathObj}
            }
            return dirSrc;
        }
        const mapRequire = new Map(); 
        if(!validPath(currentPath,mapRequire)){
            return {};
        }
        await analysisRequire(currentPath,index,__projectDir,mapRequire)
        return {[path.relative(__projectDir,currentPath)]:[...mapRequire.keys()]}
    }catch (error) {
        console.error(error) 
        return {}
    }
}
exports.module = parsePath;