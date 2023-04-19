import { _decorator, Component, EventKeyboard, input, Input, JsonAsset, KeyCode, Label, resources, Sprite, SpriteFrame } from 'cc';
import { hero } from './hero';
const { ccclass, property } = _decorator;

const roleMap = {
    1: {
        name: "勇者",
        url: "role/hero/spriteFrame"
    },
    2: {
        name: "骷髅王",
        url: "role/npc/spriteFrame"
    }
}

interface TxtDataArr {
    readonly [index: number]: {role: number, content: string};
    length: number;
}

@ccclass('dialogue')
export class dialogue extends Component {
    @property(Sprite)
    public icon: Sprite | null = null;
    @property(Label)
    public nameLabel: Label | null = null;
    @property(Label)
    public textLabel: Label | null = null

    @property(hero)
    public heroComponent: hero | null = null;

    private _textDataArr: TxtDataArr | null = null;
    private _textIndex: number| null = null;
    private _textCur: string| null = null;

    private _timeInterval: number| null = null;

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.heroComponent.enabled = false;
    }

    update(dt: number) {
        if(!this._textCur) return;
        this._timeInterval += dt;

        if(this._timeInterval> 0.1) {
            if(this.textLabel.string.length < this._textCur.length) {
                this.textLabel.string = this._textCur.slice(0, this.textLabel.string.length + 1);
            }
            this._timeInterval = 0;
        }
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.heroComponent.enabled = true;
    }



    onKeyDown(event: EventKeyboard){
        switch(event.keyCode) {
            case KeyCode.SPACE:
                this.nextTextData();
                break;
        }
    }


    init(textAssetUrl: string) {
        this._textIndex = -1;
        this._timeInterval = 0;
        this._textCur = null;
        resources.load(textAssetUrl, JsonAsset, (err, chatText) =>{
            this._textDataArr = chatText.json.chat as TxtDataArr;
            this.nextTextData();
        });
    }

    nextTextData() {
        if(++this._textIndex < this._textDataArr.length ) {
            this.setTextData(this._textDataArr[this._textIndex]);
        } else {
            this.closeDialogue();
        }
    }

    setTextData(textData: {role:number, content: string}){
        this._textCur = textData.content;
        this.nameLabel.string = roleMap[textData.role].name;
        this.textLabel.string = '';

        resources.load(roleMap[textData.role].url!, SpriteFrame, (err, spriteFrame) => {
            this.icon.spriteFrame = spriteFrame;
        });

    }

    closeDialogue(){
        this.node.active = false;
    }

}


