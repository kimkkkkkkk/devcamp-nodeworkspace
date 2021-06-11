/*블럭을 정의한다.*/
class Block extends GameObject{ //이 시점부터는 GameObject에 있는 모든 코드는
    // 다 내꺼 (다 접근할 수 있음)
    constructor(container, src, width, height, x, y, velX, velY){ // 가변형인자라해서 생략되어도 되는게 있는데
        // 명시한것은 무조건 명시하여 짝 맞춰주기 원칙,velX,velY
        
        super(container, src, width, height, x, y, velX, velY); //블럭인 내가 초기화 되기 전에, 부모를 먼저 초기화!
    }
}
 
