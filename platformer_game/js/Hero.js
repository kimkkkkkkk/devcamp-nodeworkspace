/*코드가 계속 중복된다 유지보수성이 떨어짐 
    예전에 사용했던 코드를 재사용하자*/

class Hero extends GameObject{
    constructor(container, src, width, height, x, y, velX, velY){
        //부모의 생성자 메서드를 호출하자!!(매개변수 빠짐없이)
        super(container, src, width, height, x, y, velX, velY);
    
        this.g=0.5; // 중력 가속도 효과를 내기 위한 변수, 이변수는 상속과 상관없이 내꺼!!
        this.jump=false; // 주인공의 점프상태를 판단할 수 있는 변수 (즉 점프하는지 안하는지)
    }
    //히어로는 움직임있지 않다 ! 따라서 메서드 정의가 요구된다
    //그렇지만, 부모에게 물려받은 메서드가, 현재 나의 상황에는 맞지 않을 경우
    //업그레이드할 필요가 있다!! (java, c#등 oop언어에서는 이러한 메서드 재정의기법을
    //가리켜 오버라이딩 (overring)이라 한다)

    tick(){
    //코드에서는 보이지 않지만, 현재 클래스는 GameObject의 모든것을 다 가지고 
    //있는 것과 마찬가지이다!! 즉 내것 처럼 접근할 수 있다.
        this.velY+=this.g; // 처음에 실행할때는 0.5가 더해지지만 0.5가 계속 누적되어서 눈덩이처럼 불어나간다
                                    //중력을 표현하기 위해 가속도로 처리!!
        this.y=this.y+this.velY; // 점프하기 위한 값
        this.x=this.x+this.velX; // 옆으로 가기 위한 값

        //현재 화면에 존재하는 모든 벽돌을을 대상으로, 주인공의 발바닥과 닿았는지 체크
        for(var i =0; i<blockArray.length;i++){
            var onBlock=collisionCheck(this.img,blockArray[i].img) // 나, 너
        
            /*onBlock이 true라면 벽돌에 발바닥이 닿은 거임
            1)속도를 없애고
            2) 1번의 조건은 무조건 수행하지 말고, 우리가 원할때만 수행하도록 제어하자!!
            */
            if(onBlock && this.jump==false){
                this.velY=0; // 점프버튼을 누르면, velY값을 0으로 묶어놓지 말자!!
                //위치를 벽돌위에 고정 (벽돌의 y 값 보다 자기자신의 키만큼 위로 올라가게)
                this.y=blockArray[i].y-this.height;
                 // blockArray 치먄 블럭의 y값나옴 그리고 위로 올라가는 것니까 마이너스 그리고 자기 자신의 키

             }
             //주인공이 점프한 이후, 다시 하강하는 순간을 포착하여 벽돌위에 서있을 수 있는
             //핵심 변수인 this.jump를 다시 false로 돌려놓자!!
            if(this.velY>0){ // 다시 아래로 떨어지는 순간!!
                this.jump=false;

            }
        }
    }

    render(){
        this.img.style.top=this.y+"px";
        this.img.style.left=this.x+"px";
    }
}

//this.velY는 부모꺼 인스턴스가 죽을떄까지 반복
//두 가족이 살고 있다 보면 됨 하나는 부모인 GameObject, 하나는hero
// hero 가 원할때마다 부모한테 꺼내서 쓰는 것 그래서 누적이 계속 됨 원할떄마다 쓰니까