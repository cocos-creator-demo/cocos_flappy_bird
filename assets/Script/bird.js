// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

const State = {
    READY: 0,
    FLY: 1,
    DROP: 2,
    DIE: -1
}

cc.Class({
    extends: cc.Component,

    properties: {
        flyRotation: -20,
        jumpDuration: 0.2,
        jumpHeight: 50,
        dropSpeed: 2,
        state: State.READY
    },

    init(game){
        this.game = game
    },

    onLoad() {
        let anim = this.getComponent(cc.Animation)
        if (anim) {
            this.anim = anim
            let animState = anim.play("fly")
            animState.wrapMode = cc.WrapMode.Loop
        }
        this.setInputControl()
        this.getNextPipeGroup()
    },

    setInputControl() {
        cc.eventManager.addListener(
            {
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: (keyCode, event) => {
                    switch (keyCode) {
                        case cc.KEY.space:
                            this.fly();
                            break;
                    }
                }
            },
            this.node
        );
    },
    fly() {
        this.state = State.FLY

        let node = this.node;
        node.rotation = this.flyRotation;

        let jumpAction = cc.sequence(
            cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)),
            cc.callFunc(function (target) {
                this.state = State.DROP
            }, this)
        );
        node.runAction(jumpAction);
    },
    drop() {
        let node = this.node;
        node.rotation = -this.flyRotation;

        let dropAction = cc.moveBy(this.jumpDuration, cc.p(0, -this.dropSpeed));
        node.runAction(dropAction);

    },
    getNextPipeGroup(){
        let next = this.game.pipeManager.getNext()
        console.log(next)
        this.nextPipe = next.getComponent('pipeGroup')
    },
    checkCollision() {
        let game = this.game,
            player = this.node,
            pipeGroup = this.nextPipe

        function _checkCollision(node) {
            return cc.rectIntersectsRect(
                player.getBoundingBoxToWorld(),
                node.getBoundingBoxToWorld());
        }

        // 简单矩形碰撞检测
        let isCollision =  _checkCollision(pipeGroup.topPipe) ||
            _checkCollision(pipeGroup.bottomPipe)

        if(isCollision){
            this.die()
        }else {
            // todo 判断是否通过穿过管道
            let birdLeft = this.node.x;
            let pipeRight = pipeGroup.node.x + pipeGroup.topPipe.width
            let crossPipe = birdLeft > pipeRight;
            if(crossPipe) {
                this.getNextPipeGroup()
                game.addScore()
            }
        }
    },
    die(){
        this.anim.stop();
        this.game.gameOver()

        this.state = State.DIE
    },

    update(dt) {
        if (this.state === State.DIE){
            return
        }

        if (this.state === State.DROP) {
            this.drop();
        }

        this.checkCollision()
    },
});
