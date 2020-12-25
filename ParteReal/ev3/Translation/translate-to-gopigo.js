var initProgramPy =`
import Gopigo3Wrapper
HAL = Gopigo3Wrapper.GopigoWrapper()
    
`
var initProgramSC =`
import Gopigo3Wrapper
import time
myRobot = Gopigo3Wrapper.GopigoWrapper()

`


let gopigo = {};


gopigo.translate = async (code, isGoPy) => {
    if(isGoPy){
        var code_tr = initProgramPy + code.replace("import HAL", "\n")
    }else{
        var code_tr = initProgramSC + code.replace("import HAL", "\n")
    }
    return code_tr
}

