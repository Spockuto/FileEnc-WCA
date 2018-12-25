var host = "localhost:3000";
var fileArray = [];
var ivString = "249,46,37,115,113,159,29,237,170,205,164,64,217,7,26,45" ;
var iv = new Uint8Array(ivString.split(","));

const link = document.createElement( 'a' );
link.style.display = 'none';

function convertStringToArrayBufferView(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}

function appendArray(buffer1, buffer2) {
  
  var tmp = new Uint8Array(buffer1.length + buffer2.length);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.length);
  return tmp;

};

function encryptFile(file){
	var password = "password";
   	var encrypted_data = ""; 

	return crypto.subtle.digest(
   		{
   			name: "SHA-256"
   		}, 
   		convertStringToArrayBufferView(password)
   	)
   	.then(function(result){
		return window.crypto.subtle.importKey(
			"raw", 
			result, 
			{
				name: "AES-CBC"
			}, 
			false, 
			["encrypt", "decrypt"]
		)
		.then(function(key){
			return crypto.subtle.encrypt(
				{
					name: "AES-CBC", 
					iv: iv
				}, 
				key, 
				file
			)
			.then(function(result){
				encrypted_data = new Uint8Array(result);
				return encrypted_data;
			})
			.catch(function(e){
				console.log(e);
			});
    	})
    	.catch(function(e){
    		console.log(e);
    	});
    })
    .catch(function(e){
    	console.log(e);
    });
}

function decryptFile(encrypted_data){
	var password = "password";
   	var data = ""; 

	return crypto.subtle.digest(
   		{
   			name: "SHA-256"
   		}, 
   		convertStringToArrayBufferView(password)
   	)
   	.then(function(result){
		return window.crypto.subtle.importKey(
			"raw", 
			result, 
			{
				name: "AES-CBC"
			}, 
			false, 
			["encrypt", "decrypt"]
		)
		.then(function(key){
			return crypto.subtle.decrypt(
				{
					name: "AES-CBC", 
					iv: iv
				}, 
				key, 
				encrypted_data
			)
			.then(function(result){
				data = new Uint8Array(result);
				return data;
			})
			.catch(function(e){
				console.log(e);
			});
    	})
    	.catch(function(e){
    		console.log(e);
    	});
    })
    .catch(function(e){
    	console.log(e);
    });
}

function readFile(file){
	var reader = new FileReader();

   	reader.onload = function(e) {
    	data = reader.result;
    	var tempFiles = new Object();

    	encryptFile(data)
    	.then((enc) => {
    		tempFiles.data = enc;
    	})
    	.then(function(){
         	
         	tempFiles.name = file.name;
         	tempFiles.size = tempFiles.data.length;
         	if (tempFiles.data.length <= 65536){
         		tempFiles.random = crypto.getRandomValues(new Uint8Array(tempFiles.data.length));
         	}
         	else {
         		var loop = Math.floor(tempFiles.data.length / 65536);
         		var rem = tempFiles.data.length % 65536;
         		tempFiles.random = new Uint8Array(tempFiles.data.length);
         		var i  = 0 ;
         		while ( i < loop ) {
         			tempFiles.random.set(crypto.getRandomValues(new Uint8Array(65536)) , i * 65536);
         			i++;
         		}
         		tempFiles.random.set(crypto.getRandomValues(new Uint8Array(rem)) , i * 65536);
         	}

         	tempFiles.random.forEach(function XORArrayElements(element, index, array) {
  					tempFiles.data[index] = tempFiles.data[index] ^ element;
			});

         	fileArray.push(tempFiles);
         });         	
	};
	reader.readAsArrayBuffer(file);
}

function saveFile(file1, file2, filename){
	var decrypted_data = "";
	var file = new Uint8Array(file1.length);
	console.log(file1);
	console.log(file2);
	file1.forEach(function XORArrayElements(element, index, array) {
  		file[index] = file2[index] ^ element;
	});

	decryptFile(file)
	.then((dec) => {
		decrypted_data = dec;
	})
	.then(function(){
		const blob = new Blob( [decrypted_data.buffer] , {type : 'application/octet-stream'});
		const objectURL = URL.createObjectURL( blob );
		link.href = objectURL ;
		link.download = filename ;
		link.click()
	});
}

function waitForFileArray(){
    if(fileArray.length == window.files.length){
        fileArray.forEach(function(item, index){

	    	var fileData1 = new FormData();
	    	fileData1.append('name' , item.name);
	    	fileData1.append('size' , item.size);
	    	fileData1.append('data' , item.data);
	    	console.log(fileData1);
	    	var fileData2 = new FormData();
	    	fileData2.append('name' , item.name);
	    	fileData2.append('size' , item.size);
	    	fileData2.append('data' , item.random);
	    	console.log(fileData2);
	    	$.ajax({
	              url: "http://" + host + "/upload0",
	              type: 'POST',
	              data: fileData1,
	              processData: false,
	              contentType: false,
	              success: function(data){
	                  console.log('Upload successful! - Server0 ');
	            }
             });

	        $.ajax({
                  url: "http://" + host + "/upload1",
                  type: 'POST',
                  data: fileData2,
                  processData: false,
                  contentType: false,
                  success: function(data){
                      console.log('Upload successful! - Server1');
                }
	        });
	   	});
    }
    else{
        setTimeout(waitForFileArray, 250);
    }
}

function retrive(filename){
	var file1 , file2;
	var form = new FormData();
	form.append('name', filename);
	$.when(
		$.ajax({
                  url: "http://" + host + "/retrieve0",
                  type: 'POST',
                  data: form,
                  processData: false,
                  contentType: false,
                  success: function(data){
                      //file1 = new Uint8Array($.map(data, function(e) { return e }));
                      file1 = new Uint8Array(data.split(","));
                }
	    }),
	    $.ajax({
                  url: "http://" + host + "/retrieve1",
                  type: 'POST',
                  data: form,
                  processData: false,
                  contentType: false,
                  success: function(data){
                     //file2 = new Uint8Array($.map(data, function(e) { return e }));
                      file2 = new Uint8Array(data.split(","));
                }
	    })
	).then(function(){
		saveFile(file1, file2, filename);
	});
}

$(document).ready(function(){
  document.body.appendChild( link );

  $('#filesubmit').prop("disabled", true);
 
  $('#inputGroupFile01').on('change', function(){
	  window.files = $(this).get(0).files; 
	  
	  if(window.files.length > 0){
	  	$('#filesubmit').prop("disabled", false);
	  }
	  else {
	  	$('#filesubmit').prop("disabled", true);
	  }
   });

   $("#filesubmit").click(function (e) {
   	
	   	for(var i = 0; i < window.files.length; i++){
	        readFile(window.files[i]);
	    }
		waitForFileArray();
    });
});

