/**
 * Some helper functions I used for this Project
 * @author JLCD 
 * @link https://github.com/DerDeathraven
 * 
 */

function jlcd(){
    console.log("jlcd was here");
}
/**
 * 
 * @param {Array<Object>} array Array of objects to be searched
 * @param {String} path Path to value
 * @param {Object} item given Object
 * @returns 
 */
function arrayItemAlreadyExists(array,path,item){
    var ret = -1;
    var value = findProperty(path,item)
    array.forEach((f,i)=>{
        var givenValue = findProperty(path,f)
        if(givenValue == value){
            ret = i;
        }   
    })
    return ret;
}

/**
 * Finds a property with given Path
 * 
 * @example findProperty("test.on",val) -> val.test.on 
 * @param {String} path Path to property
 * @param {Object} obj object to search
 * @returns {* | null}
 */
 function findProperty(path,obj){

    var buff = path.split('.').reduce(function(prev, curr) {
        var buffer = prev ? prev[curr] : null

        if(buffer == null ){
            
            return prev
        }
        
        return buffer
    }, obj || self)

   
    
    return buff
}
module.exports = {
    arrayItemAlreadyExists,
    findProperty,
    jlcd
}