/*인류를 정의한다~~  상위로 갈수록 높은직급일수록 추상적이다, 
    코드가 짧아진다*/
class Human{
    constructor(color){
        this.strength;
        this.color=color;
        this.eyeCount=2;
        console.log("부모인 Human 객체의 초기화 완료");
    }
    walk(){
        console.log("걷는다");
    }
}