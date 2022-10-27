import InvalidColorError from "../exceptions/InvalidColourError"

const validateColor = (color: string)=>{
    if(!color.match(/[0-9A-Fa-f]{6}/)){
        throw new InvalidColorError()
    }
    return color;
}
export default validateColor;