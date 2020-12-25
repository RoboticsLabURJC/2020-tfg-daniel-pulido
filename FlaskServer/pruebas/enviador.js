function send_code_to_GoPiGo() {
   var editor = ace.edit("ace");
   let code = editor.getValue();
   console.log(code);
   const message = {
      method: "GET"
   };
   url = 'http://192.168.1.200:8001/run?python_code=' + JSON.stringify(code);
   fetch(url, message)
      .then(function(response) {
         if(response.ok){
            responseOk = true
         }else{
            responseOk = false
         }
           return response.text();
         })
      .then(function(data) {
         if(responseOk){
            console.log("Ok")
         }else{
            console.log("Send Fail")
         }

      })
      .catch(function(err) {
         console.error(err);
      });
}
