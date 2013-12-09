/**
 * Created with JetBrains WebStorm.
 * User: raviteja_ganireddy
 * Date: 08/12/13
 * Time: 21:37
 * To change this template use File | Settings | File Templates.
 */

exports.toHtml=function(str){
    var i=str.indexOf("\n");
    var j=0;
    while(i!=j)
    {
        str=str.replace("\n"," <br> ");
        j=i;
        i=str.indexOf("\n");
    }
    return str;
}