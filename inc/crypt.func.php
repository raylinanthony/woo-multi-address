<?php
/**
* Funciones para la gestion de encriptación de datos
* @author Raylin Aquino
* @version 1.0
* @date 03-03-2014
*/
function encryptIt($string, $key = "AISHKJASHAIUSYASIUYAITWYGQW") {
	$result = '';
	
	
	for($i=0; $i<strlen($string); $i++) {
	$char = substr($string, $i, 1);
	$keychar = substr($key, ($i % strlen($key))-1, 1);
	$char = chr(ord($char)+ord($keychar));
	$result.=$char;
	}
	
	return urlencode(base64_encode($result));
}
function decryptIt($string, $key = "AISHKJASHAIUSYASIUYAITWYGQW") {
	$result = '';
	$string = base64_decode(urldecode($string));
	for($i=0; $i<strlen($string); $i++) {
	$char = substr($string, $i, 1);
	$keychar = substr($key, ($i % strlen($key))-1, 1);
	$char = chr(ord($char)-ord($keychar));
	$result.=$char;
	}
	return $result;
}


?>