var http = require("http");
var express =require("express"); //외부 설치
var fs=require("fs");
var ejs=require("ejs"); // 외부 설치
var oracledb=require("oracledb");// 외부 설치
var static =require("serve-static"); // 정적자원을 처리하기 위한 모듈 이것을 적어야 다른 파일에서 가져온 것을 실행시킬 수 있다
// npm install serve-static 설치
var mymodule=require("./lib/mymodule.js");

//오라클 디비에 커밋을 디폴트로 설정하자!!
oracledb.autoCommit=true; // 쿼리문 실행시마다 트랜잭션을 commit으로 처리!!
oracledb.fetchAsString=[oracledb.CLOB]; // clob데이터를 string으로

var app = express();  // 서버를 개선하고 코드량을 줄이기 위해서 쓰임

//미들웨어 등록
app.use(static(__dirname+"/static")); //정적자원의 루트 디렉토리 등록!!
app.use(express.urlencoded({extended:true})); // post 방식 데이터 처리

app.set("view engine", "ejs"); //뷰엔진 등록 (서버 스크립트 선택) 
//일단 뷰엔진이 등록되고 나면, 확장자를 명시할 필요없다.. 왜? views라는 정해진
//디렉토리를 참조할거고, 그 안에 있는 모든 파일은 다 ejs이기 때문에..

// 이 시점 이후 부터는 conStr변수의 값은 변할 수 없다~~(상수화 시킴)
const conStr={
    user:"node",
    password:"node",
    connectString:"localhost/XE" //1521가 아니면 localhost:1522/XE
};
//게시판 목록 요청 처리
app.get("/news/list", function(request, response){
    //클라이언트가 전송한 파라미터 받기!!
    var currentPage = request.query.currentPage;// 클라이언트가 보기를 원하는 페이지수 (파라미터 , 겟방식으로 넘어온거 받은것, ejs와 상관 노노)
    
    // 게시판의 최초접속이라면, currentPage정보가 없기 때문에 1페이지로 간주함
    if(currentPage==undefined){ 
        currentPage=1;
    }
    
    console.log("currentPage ", currentPage);
    
    // 오라클에서 readfile을 가져온 시점에 readfile이 읽어져야 한다
    oracledb.getConnection(conStr, function(err, con){
        if(err){
            console.log("접속실패", err);
        }else{
            console.log("접속 성공");
            //쿼리문 실행
            var sql="select  n.news_id, title, writer, regdate, hit , count(msg) as cnt"
            sql+=" from news n  left outer join  comments c";
            sql+=" on n.news_id=c.news_id";
            sql+=" group by n.news_id, title, writer, regdate, hit";
            sql+=" order by n.news_id desc";

            
            
            con.execute(sql, function(error, result){ //mysql은 con.query , 오라클은con.execute
                if(error){
                    console.log(error);
                }else{
                    console.log("result는" ,result);

                    fs.readFile("./views/news/list.ejs", "utf8",  function(error, data){
                        if(error){
                            console.log(error);
                        }else{
                            var r = ejs.render(data,{
                                //ejs에 넘겨줄 데이터 지정,변수 : 값
                                param:{
                                    page:currentPage,
                                    /*result는 mysql과 틀리게  파워쉘에서 json 객체의 rows속성에
                                    2차원 배열에 들어있따.. rows[[]]*/
                                    record:result.rows,
                                    lib:mymodule /*ejs가 사용할 수 있또록 lib 명으로 모듈 전달 */
                                }
                            }); // ejs해석 및 실행하기!!
                            response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                            response.end(r); // 실행한 결과 전송하기!!
                        }
                    });
                }
                con.close();
            });
        }
    }); // 오라클 접속 및 접속객체 가져오기

    
});

// 등록요청 처리
app.post("/news/regist", function(request, response){
    //파라미터 받기!!(post)
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;

    //오라클에 넣기
    oracledb.getConnection(conStr, function(err, con){
        if(err){
            console.log("접속실패", err);
        }else{
            var sql="insert into news(news_id, title, writer, content)"; // mysql은 자동으로 news_id가 들어가서 넣으면 안됨
            sql+=" values(seq_news.nextval, :1, :2, :3)";
            con.execute(sql, [title, writer, content], function(error, result){
                if(error){
                    console.log("등록 중 에러발생", error); // 쿼리문이 잘못되었다는 것(가동 멈춘다는 심각한 에러)
                }else{
                    //여기서도 무조건 등록된다는 보장은 없다.. 즉 오라클에 반영되었느냐 여부는
                    //result를 통해 또 알아봐야 한다..
                    console.log("result는", result);
                    if(result.rowsAffected==0){ //등록실패
                        //status 코드란? http 통신 서버의 상태를 나타내는 기준 (500 서버의 로직이 잘못되었다. 400은 파일이 잘 못)
                        response.writeHead(500, {"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("등록실패","/news/list"));
                    }else{ //등록성공
                        response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("등록성공","/news/list"));
                    }
                }
                con.close(); // oracle 접속해제
            });
        }
    });

});

//상세보기 요청 처리
app.get("/news/detail", function(request, response){
    //express 모듈이 response객체의 기능을 업그레이드 함!!
    //response.render() 메서드는 기본적으로 views라는 정해진 디렉토리안에
    //정해진, 뷰엔진을 찾게된다.. (뷰엔진은 개발자가 선택할 수 있다..), 뷰엔진- 앞으로 쓸 형식
    var news_id = request.query.news_id; // get방식으로 전송된 파라미터 받기!!
    
    //오라클 연동하기
    oracledb.getConnection(conStr, function(err, con){
        if(err){
            console.log(err);
        }else{
            var sql="select * from news where news_id="+news_id;
            con.execute(sql, function(error, result){
                if(error){
                    console.log("SQL실행 중 에러 발생", error); // 심각한 에러
                }else{
                    console.log("한 건 가져오기 결과는",result);

                    //댓글 목록도 가져와야 한다?? news_id=:1 -> 내가 보는 기사 바인드변수
                    sql="select * from comments where news_id=:1 order by comments_id asc";
                    con.execute(sql,[ news_id ] ,function(e, record){
                        if(e){
                            console.log("코멘트 목록 가져오기 에러", e);
                        }else{
                            //fs.readFile() +  ejs.render();    ↓한줄로 줄인것
                            response.render("news/detail", { // ./ 찍어도 되고 안해도 되고, views안에 있음.
                                news:result.rows[0], //뉴스 목록 뿐만 아니라
                                commentsList:record.rows, // 코멘트 목록 , rows는 이차원 배열 [[]]
                                lib:mymodule    //날짜 처리를 위해서
                            }); 
                        }
                        con.close();
                    });
                }
            });
        }
    });

});

//코멘트 댓글 등록 요청 처리 
app.post("/comments/regist", function(request, response){
    // 파라미터 받기
    var news_id=request.body.news_id;
    var msg=request.body.msg;
    var author=request.body.author;

    oracledb.getConnection(conStr, function(err, con){
        if(err){
            console.log("접속실패", err);
        }else{
            var sql="insert into comments(comments_id, news_id, msg, author)";
            sql+=" values(seq_comments.nextval, :1, :2, :3)";

            con.execute(sql, [news_id, msg, author ] , function(error, result){ //쿼리문 실행
                if(error){
                    console.log(error, "insert 쿼리실행중 에러발생");
                    //server's internal fatal error!!
                   // response.writeHead(500, {"Content-Type":"text/html;charset=utf-8"});//클라이언트도 에러를 알게
                    //response.end("이용에 불편함을 드려 죄송합니다..");
                    var str="";
                    str+="{";
                    str+="\"result\":0";
                    str+="}";
                    response.end(str); //end() 메서드는 문자열을 인수
                }else{
                    //클라이언트가 댓글 등록요청을 비동기방식으로 요청했기 때문에, 클라이언트의 브라우저는
                    //화면이 유지되어햐 한다. 서버는 클리언트가 보게 될 디자인 코드를 보낼 이유가 없다.
                    //왜? 보내는 순간 화면이 바뀌어 버리므로,, (이것은 클라이언트가 원하는 게 아니다)
                    //그럼 뭐를 보내야 하나? 디자인 일부에 사용할 데이터만 보내면 된다!!

                    response.writeHead(200, {"Content-Type":"text/json;charset=utf-8"});
                    // 네트워크상으로 주고받는 데이터는 문자열화 시켜서 주고받는다!!
                    var str="";
                    str+="{";
                    str+="\"result\":1";
                    str+="}";
                    response.end(str); //end() 메서드는 문자열을 인수로 받는다!!


                    //response.end({}); 그래서 이 제이슨을 보낼 수 없다.
                    //response.end("클라이언트의 브라우저에 대체될 내용 내용 hahaha"); 
                    //response.end(mymodule.getMsgUrl("댓글등록","/news/detail?news_id="+news_id));//클라이언트로 하여금 지정한 url로 재접속하라!!

                }
                con.close();
            });
        }
    });

});

//코멘트 목록 가져오기
app.get("/comments/list", function(request, response){
    var news_id=request.query.news_id; //해당 뉴스 기사..
    var sql="select * from comments where news_id="+news_id; // 모두가져오는게 아니라 해당 객체
    sql+=" order by comments_id desc";

   oracledb.getConnection(conStr, function(err, con){
       if(err){
            console.log("접속실패", err);
       }else{
            con.execute(sql, function(error, result, fields){ //select 문은 매개변수가 세개임
                if(error){
                    console.log("등록 에러발생", error);
                }else{
                    console.log("result is", result);

                    //디자인 코드가 아닌, 코멘트 목록을 보내자!!!
                    response.writeHead(200,{"Content-Type":"text/json;charset=utf-8"});
                    //코멘트 목록을 문자열화 시켜 보내자!!
                    response.end(JSON.stringify(result)); // result를 문자열화 보냄 자동으로 변경해줌 
                }
                con.close();
            });
       }
   });
});
var server = http.createServer(app); //익스프레스객체
server.listen(8888,function(){
    console.log("The Server with Oracle is running at 8888 port...");
});