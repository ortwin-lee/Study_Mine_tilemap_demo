import {_decorator, Node, Component, TiledMap, math} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('fog')
export class fog extends Component {
    @property(Node)
    public mapNode: Node | null = null;
    @property(Node)
    public heroControl: Node | null = null;

    private _lastFrameHeroMapIndexArr: { i: number, j: number }[] | null = null;

    /**
     * 生成并更新战争迷雾
     * @param mapNameArr 地图数组
     * @param radius 可视区域半径
     */
    public generatorFog(mapNameArr: string[][], radius: number) {
        let mapArr: Node[] = this.mapNode.children;
        if (!mapArr[0] || !mapNameArr) return;
        let tiledMap = mapArr[0].getComponent(TiledMap);
        let tileSize = tiledMap.getTileSize();
        let mapSize = tiledMap.getMapSize();
        let mapArrSize = {
            height: mapNameArr.length,
            width: mapNameArr[0].length
        };

        let heroPos = this.heroControl.position;
        let heroPosIndex = this.getPosIndex(heroPos, mapSize, tileSize);
        let heroMapIndex = this.getMapIndex(heroPos, mapSize, tileSize);
        let generatorRegion = this.generatorRegion(heroPosIndex, heroMapIndex, radius, mapSize, mapArrSize);
        this.setFogLayers(generatorRegion);
        this.setCulling(heroMapIndex, 2, mapArrSize);

    }


    /**
     * 求角色对应的tileMap索引坐标
     * @param heroPos 角色位置
     * @param mapSize 地图块的tile大小
     * @param tileSize 每个瓦片的大小
     * @private
     */
    private getPosIndex(heroPos: { x, y }, mapSize: math.Size, tileSize: math.Size) {
        return {
            i: Math.floor((-heroPos.y + Math.floor(mapSize.height * tileSize.height / 2)) % (mapSize.height * tileSize.height) / tileSize.height),
            j: Math.floor((heroPos.x + Math.floor(mapSize.width * tileSize.width / 2)) % (mapSize.width * tileSize.width) / tileSize.width)
        };
    }

    /**
     * 求角色所在地图块对应地图数组的索引
     * @param heroPos 角色位置
     * @param mapSize 地图块的tile大小
     * @param tileSize 每个瓦片的大小
     * @private
     */
    private getMapIndex(heroPos: { x, y }, mapSize: math.Size, tileSize: math.Size) {
        return {
            i: Math.floor((-heroPos.y + Math.floor(mapSize.height * tileSize.height / 2)) / (mapSize.height * tileSize.height)),
            j: Math.floor((heroPos.x + Math.floor(mapSize.width * tileSize.width / 2)) / (mapSize.width * tileSize.width))
        };
    }


    /**
     * 生成视野区域
     * @param heroPosIndex 角色位置
     * @param heroMapIndex 地图块索引
     * @param radius 可视区域半径
     * @param mapSize 地图块的tile大小
     * @param mapArrSize 地图数组大小
     * @private
     * @returns region 返回每个tiledTile对应的地图块和相应的索引
     */
    private generatorRegion(
        heroPosIndex: { i: number, j: number },
        heroMapIndex: { i: number, j: number },
        radius: number,
        mapSize: math.Size,
        mapArrSize: { height, width }) {
        let arr = this.manhattanDistancePoints(heroPosIndex, radius);

        let region: { heroMapIndex: { i: number, j: number }, heroPosIndex: { i: number, j: number } }[] = [];
        for (const posIndex of arr) {
            if (posIndex.i < 0) {
                if (posIndex.j < 0) {
                    if (heroMapIndex.i - 1 >= 0 && heroMapIndex.j - 1 >= 0) {
                        region.push({
                            heroMapIndex: {
                                i: heroMapIndex.i - 1,
                                j: heroMapIndex.j - 1
                            },
                            heroPosIndex: {
                                i: posIndex.i + mapSize.height,
                                j: posIndex.j + mapSize.width
                            }
                        });
                    }
                } else if (posIndex.j >= mapSize.width) {
                    if (heroMapIndex.i - 1 >= 0 && heroMapIndex.j + 1 < mapArrSize.width) {
                        region.push({
                            heroMapIndex: {
                                i: heroMapIndex.i - 1,
                                j: heroMapIndex.j + 1
                            },
                            heroPosIndex: {
                                i: posIndex.i + mapSize.height,
                                j: posIndex.j - mapSize.width
                            }
                        });
                    }
                } else {
                    if (heroMapIndex.i - 1 >= 0) {
                        region.push({
                            heroMapIndex: {
                                i: heroMapIndex.i - 1,
                                j: heroMapIndex.j
                            },
                            heroPosIndex: {
                                i: posIndex.i + mapSize.height,
                                j: posIndex.j
                            }
                        });
                    }
                }
            } else if (posIndex.i >= mapSize.height) {
                if (posIndex.j < 0) {
                    if (heroMapIndex.i + 1 < mapArrSize.height && heroMapIndex.j - 1 >= 0) {
                        region.push({
                            heroMapIndex: {
                                i: heroMapIndex.i + 1,
                                j: heroMapIndex.j - 1
                            },
                            heroPosIndex: {
                                i: posIndex.i - mapSize.height,
                                j: posIndex.j + mapSize.width
                            }
                        });
                    }
                } else if (posIndex.j >= mapSize.width) {
                    if (heroMapIndex.i + 1 < mapArrSize.height && heroMapIndex.j + 1 < mapArrSize.width) {
                        region.push({
                            heroMapIndex: {
                                i: heroMapIndex.i + 1,
                                j: heroMapIndex.j + 1
                            },
                            heroPosIndex: {
                                i: posIndex.i - mapSize.height,
                                j: posIndex.j - mapSize.width
                            }
                        });
                    }
                } else {
                    if (heroMapIndex.i + 1 < mapArrSize.height) {
                        region.push({
                            heroMapIndex: {
                                i: heroMapIndex.i + 1,
                                j: heroMapIndex.j
                            },
                            heroPosIndex: {
                                i: posIndex.i - mapSize.height,
                                j: posIndex.j
                            }
                        });
                    }
                }
            } else {
                if (posIndex.j < 0) {
                    if (heroMapIndex.j - 1 >= 0) {
                        region.push({
                            heroMapIndex: {
                                i: heroMapIndex.i,
                                j: heroMapIndex.j - 1
                            },
                            heroPosIndex: {
                                i: posIndex.i,
                                j: posIndex.j + mapSize.width
                            }
                        });
                    }
                } else if (posIndex.j >= mapSize.width) {
                    if (heroMapIndex.j + 1 < mapArrSize.width) {
                        region.push({
                            heroMapIndex: {
                                i: heroMapIndex.i,
                                j: heroMapIndex.j + 1
                            },
                            heroPosIndex: {
                                i: posIndex.i,
                                j: posIndex.j - mapSize.width
                            }
                        });
                    }
                } else {
                    region.push({
                        heroMapIndex: {
                            i: heroMapIndex.i,
                            j: heroMapIndex.j
                        },
                        heroPosIndex: {
                            i: posIndex.i,
                            j: posIndex.j
                        }
                    });
                }
            }
        }
        return region;
    }

    /**
     * 求曼哈顿距离内的所有点的坐标（包括在曼哈顿距离上的点）
     * @param pos 中心的坐标
     * @param d 曼哈顿距离
     * @private
     */
    private manhattanDistancePoints(pos: { i: number, j: number }, d: number) {
        let arr: { i: number, j: number }[] = [];
        for (let i = pos.i - d; i <= pos.i + d; i++) {
            for (let j = pos.j - d; j <= pos.j + d; j++) {
                if (Math.abs(i - pos.i) + Math.abs(j - pos.j) <= d) {
                    arr.push({i: i, j: j});
                }
            }
        }

        return arr;
    }


    private setFogLayers(generatorRegion: {
        heroMapIndex: { i: number, j: number },
        heroPosIndex: { i: number, j: number }
    }[]) {
        let fogRemoveArr: Map<string, Set<{ i: number, j: number }>> = new Map<string, Set<{ i: number; j: number }>>();
        for (let region of generatorRegion) {
            let blockNodeName = `${region.heroMapIndex.i},${region.heroMapIndex.j}`;
            if (fogRemoveArr.has(blockNodeName)) {
                let set = fogRemoveArr.get(blockNodeName);
                set.add(region.heroPosIndex);
            } else {
                fogRemoveArr.set(blockNodeName, new Set([region.heroPosIndex]));
            }
        }

        for (const [key, value] of fogRemoveArr) {
            let childName = this.mapNode.getChildByName(key);
            if (!childName) continue;
            let tiledMap = childName.getComponent(TiledMap);
            let tiledLayer = tiledMap.getLayer('smog');

            for (const index of value) {
                let tiledTile = tiledLayer.getTiledTileAt(index.j, index.i, true);
                tiledTile.grid = 0;
            }
        }

    }

    /**
     * 关闭附近地图节点的裁剪
     * @param heroMapIndex 地图块索引
     * @param radius 裁剪半径
     * @param mapArrSize 地图数组大小
     * @private
     */
    private setCulling(heroMapIndex: { i: number, j: number }, radius: number, mapArrSize: { height, width }) {
        const nowIndexArr = this.manhattanDistancePoints(heroMapIndex, radius);


        const diffDisabled = nowIndexArr.filter(x =>
            !this._lastFrameHeroMapIndexArr ? true : !this._lastFrameHeroMapIndexArr.includes(x)
        );

        const diffEnabled = this._lastFrameHeroMapIndexArr?.filter(x => !nowIndexArr.includes(x));

        diffDisabled?.forEach( map =>{
            if (map.i < 0 || map.i >= mapArrSize.height || map.j < 0 || map.j >= mapArrSize.width) {
                return;
            }
            let child = this.mapNode.getChildByName(`${map.i},${map.j}`);
            if (!child) return;
            let tiledMap = child.getComponent(TiledMap);
            tiledMap.enableCulling = false;
        });

        diffEnabled?.forEach( map => {
            if (map.i < 0 || map.i >= mapArrSize.height || map.j < 0 || map.j >= mapArrSize.width) {
                return;
            }
            let child = this.mapNode.getChildByName(`${map.i},${map.j}`);
            if (!child) return;
            let tiledMap = child.getComponent(TiledMap);
            tiledMap.enableCulling = true;
        });

        this._lastFrameHeroMapIndexArr = nowIndexArr;
    }


}


