import {
    _decorator,
    BoxCollider2D,
    Component,
    EPhysics2DDrawFlags,
    ERigidBody2DType,
    Node,
    PhysicsSystem2D,
    RigidBody2D,
    TiledMap,
    Vec2,
    resources,
    TiledMapAsset,
    UITransform,
    math
} from 'cc';
import {dialogue} from './dialogue';
import {RandomMap} from "./mapRandomGenerator";
import {fog} from "./fog";

const {ccclass, property} = _decorator;

@ccclass('game')
export class game extends Component {
    @property(Node)
    public mapNode: Node | null = null;
    @property(Node)
    public heroControl: Node | null = null;
    @property(Node)
    public dialogueNode: Node | null = null;
    @property(Node)
    public loading: Node | null = null;
    @property(fog)
    public fog: fog | null = null;
    @property(Node)
    public loadingCameraNode: Node | null = null;

    private _mapNameArr: string[][] = null;

    onLoad() {
        const system = PhysicsSystem2D.instance;
        system.enable = true;
        // system.debugDrawFlags = EPhysics2DDrawFlags.Shape;
        // 物理步长，默认 fixedTimeStep 是 1/60
        // system.fixedTimeStep = 1/30;
        // // 每次更新物理系统处理速度的迭代次数，默认为 10
        // system.velocityIterations = 8;
        // // 每次更新物理系统处理位置的迭代次数，默认为 10
        // system.positionIterations = 8;

        this.loading.active = true;
        this.loadingCameraNode.active = true;
        let mapNameArr: string[][] = RandomMap.instance(10, 10, 50).generator();
        this._mapNameArr = mapNameArr;
        this.initMap(mapNameArr);

    }

    update() {
        this.fog.generatorFog(this._mapNameArr,3);
    }

    initMap(mapNameArr: string[][]) {
        let heroStrPosArr: { i: number, j: number }[] = [];
        let loadCount: number = 0;
        for (let i = 0; i < mapNameArr.length; i++) {
            for (let j = 0; j < mapNameArr[i].length; j++) {
                let mapName = mapNameArr[i][j];
                if (mapName === '00000') continue;

                heroStrPosArr.push({i: i, j: j});
                loadCount++;
                resources.load(`tileMap/${mapName}`, TiledMapAsset, (err, mapAsset) => {
                    let node: Node = new Node();


                    node.setPosition(j * 384, -i * 384);
                    node.name = `${i},${j}`;
                    let mapCom: TiledMap = node.addComponent(TiledMap);
                    mapCom.tmxAsset = mapAsset;
                    mapCom.enableCulling = true;

                    this.initMapNode(node);

                    node.parent = this.mapNode;
                    let nodeUI: UITransform = node.addComponent(UITransform);
                    nodeUI.setAnchorPoint(0, 0);

                    if (--loadCount == 0) {
                        let tiledMap = node.getComponent(TiledMap);
                        let tiledSize = tiledMap.getTileSize();
                        let mapSize = tiledMap.getMapSize();
                        let heroStrPosIndex = heroStrPosArr[Math.floor(Math.random() * heroStrPosArr.length)];
                        this.heroControl.setPosition(heroStrPosIndex.j * mapSize.width * tiledSize.width + tiledSize.width / 2, -heroStrPosIndex.i * mapSize.height * tiledSize.height + tiledSize.height / 2);

                        this.loadingCameraNode.active = false;
                        this.loading.active = false;
                    }
                });
            }
        }


    }


    initMapNode(mapNode: Node) {
        let tiledMap = mapNode.getComponent(TiledMap);
        let tiledSize = tiledMap!.getTileSize();
        let layer = tiledMap!.getLayer('wall');
        let layerSize = layer!.getLayerSize();
        let smogLayer = tiledMap!.getLayer('smog');
        smogLayer.node.active = true;

        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                let tiled = layer!.getTiledTileAt(i, j, true);
                if (tiled!.grid != 0) {
                    let rigidBody = tiled!.node.addComponent(RigidBody2D);
                    let collider = tiled!.node.addComponent(BoxCollider2D);
                    rigidBody.type = ERigidBody2DType.Static;
                    rigidBody.group = 1 << 1;
                    collider.offset = new Vec2(tiledSize.width / 2, tiledSize.height / 2);
                    collider.size = tiledSize;
                    collider.apply()
                }
            }
        }
    }

    displayDialogue(textAssetUrl: string) {
        this.dialogueNode!.active = true;
        let dialog = this.dialogueNode!.getComponent("dialogue") as dialogue;
        dialog.init(textAssetUrl);
    }
}


