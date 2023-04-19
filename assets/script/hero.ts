import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Vec2, Vec3, Animation, RigidBody2D, Scheduler, director } from 'cc';
const { ccclass } = _decorator;


const KeyInput: {} = {};

@ccclass('hero')
export class hero extends Component {
    private _speed: number = 8;
    private _direction: Vec2 | null = null;
    private _linearVelocity: Vec2 | null = null;

    private _state: string = null;

    private _rigidBody: RigidBody2D | null = null;

    private _animation: Animation | null = null;

    onLoad() {
        this._direction = new Vec2();
        this._animation = this.node.getComponent(Animation);
        this._rigidBody = this.node.getComponent(RigidBody2D);
    }

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(dt: number) {
        if (KeyInput[KeyCode.KEY_A] && KeyInput[KeyCode.KEY_D]) {
            this._direction.x = 0;
        } else if (KeyInput[KeyCode.KEY_A]) {
            this._direction.x = -1;
        } else if (KeyInput[KeyCode.KEY_D]) {
            this._direction.x = 1;
        } else {
            this._direction.x = 0;
        }

        if (KeyInput[KeyCode.KEY_W] && KeyInput[KeyCode.KEY_S]) {
            this._direction.y = 0;
        } else if (KeyInput[KeyCode.KEY_W]) {
            this._direction.y = 1;
        } else if (KeyInput[KeyCode.KEY_S]) {
            this._direction.y = -1;
        } else {
            this._direction.y = 0;
        }



        this._linearVelocity = this._rigidBody.linearVelocity;
        if (this._direction.x) {
            this._linearVelocity.y = 0;
            this._linearVelocity.x = this._speed * this._direction.x;
        } else if (this._direction.y) {
            this._linearVelocity.x = 0;
            this._linearVelocity.y = this._speed * this._direction.y;
        } else {
            this._linearVelocity.x = this._linearVelocity.y = 0;
        }
        this._rigidBody.linearVelocity = this._linearVelocity;


        let state: string = '';

        if (this._direction.x === 1) {
            state = 'hero_right';
        } else if (this._direction.x === -1) {
            state = 'hero_left';
        } else if (this._direction.y === 1) {
            state = 'hero_up';
        } else if (this._direction.y === -1) {
            state = 'hero_down';
        } else {
            state = 'stand';
        }

        if (state) {
            this.setState(state);
        }




    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                KeyInput[KeyCode.KEY_A] = 1;
                break;
            case KeyCode.KEY_D:
                KeyInput[KeyCode.KEY_D] = 1;
                break;
            case KeyCode.KEY_W:
                KeyInput[KeyCode.KEY_W] = 1;
                break;
            case KeyCode.KEY_S:
                KeyInput[KeyCode.KEY_S] = 1;
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                KeyInput[KeyCode.KEY_A] = 0;
                break;
            case KeyCode.KEY_D:
                KeyInput[KeyCode.KEY_D] = 0;
                break;
            case KeyCode.KEY_W:
                KeyInput[KeyCode.KEY_W] = 0;
                break;
            case KeyCode.KEY_S:
                KeyInput[KeyCode.KEY_S] = 0;
                break;
        }
    }

    setState(state: string): void {
        if (this._state === state) return;

        this._state = state;
        if (this._state == 'stand') {
            this._animation.pause();
        } else {
            this._animation.play(this._state);
        }

    }


}


