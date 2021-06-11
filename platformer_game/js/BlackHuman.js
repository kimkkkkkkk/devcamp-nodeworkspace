/*흑인을 정의한다. 변수(상태), 함수(동작)
extends는 확장
상위 클래스를 구체적인 개념으로 확장한다는 의미
부모의 클래스 접근할 수 있음
나의 메모리 영역뿐만 아니라,Human 이라는 객체의 인스턴스의 메모리
영역도 내것처럼 쓰겠따 즉 확장하겠다!
parent -> 바깥쪽 div?
부모를 가리키는 말 super
var b = new BlackHuman(); 괄호안은 블랙휴먼의 생성자(constructor)을 호출하는 것
*/
class BlackHuman extends Human{ //휴먼의 클래스를 상속받는다
    constructor(color){
        //바로 이 시점이 흑인이 태어나는 시점이므로, 다른 어떠한 코드보다도 앞서서
        //부모님을 태어나게 해야한다..
        //자식이 초기화가 되기 이전에 부모님을(super) 호출
        
        // this.x=5; 에러발생 ..왜? 부모의 초기화보다 자식의 초기화가 앞설수 없기 때문
        //금지되어 있다.. 부모 생성자 호출보다 앞서는 코드의 존재금지!!
        super(color); //부모님의 생성자(); 호출하는 순간 자식이 초기화가 안됨
        console.log("자식인 blackhuman 초기화 완료");
    }
    playBasketBall(){
        console.log("농구를 한다");
}
playBoxing(){
        console.log("복싱을 한다");
    
    }
}