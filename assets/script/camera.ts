import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('camera')
export class camera extends Component {
    @property(UITransform)
    public heroUITransform: UITransform | null = null;
    @property(UITransform)
    public cameraParent: UITransform | null = null;

    private _heroPosition: Vec3 | null = null;

    start() {
        this._heroPosition = new Vec3(0, 0, 0);
    }

    lateUpdate(deltaTime: number) {
        if(!this.heroUITransform) return;

        let worldPos = this.heroUITransform.convertToWorldSpaceAR(this._heroPosition);
        let nodePos = this.cameraParent.convertToNodeSpaceAR(worldPos);
        this.node.setPosition(nodePos);
    }
}


