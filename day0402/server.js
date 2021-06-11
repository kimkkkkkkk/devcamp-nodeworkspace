var http = require("http"); //내장 모듈 따라서 별도의 설치 불필요
var fs = require("fs"); // 파일을 제어하는 모듈 (내장모듈)

var server = http.createServer(function(request, response){
    //request: 클라이언트의 요청정보
    //response : 클라이언트에 응답정보

   // fs.readFile("파일명,""인코딩",읽었을때 실행할 함수);
    fs.readFile("./regist_form.html","utf8",function(err, data){
       
        // 클라이언트에 지정한 문자열 전송
        //HTTP의 형식을 갖추어서 클라이언트에게 응답을 해보자!!
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"}); //header 정보를 제대로 갖추워서 응답하자!
                                    //(응답코드, 제이슨표시{컨텐트타입은 텍스트고/html이며(파일형식) ;uft8형식이야})-> 여기서 ;은 그리고 라는 뜻 (분리가능)
    
        response.end(data); 
    });

}); // 서버객체 생성

server.listen(7878,function(){
    console.log("My Server is running at 7878...")
}); // 서버가동