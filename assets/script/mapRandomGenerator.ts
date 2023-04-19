export class RandomMap {
    readonly _maxHCnt: number;
    readonly _maxWCnt: number;
    readonly _directionArr = [
        {i: -1, j: 0},
        {i: 1, j: 0},
        {i: 0, j: -1},
        {i: 0, j: 1}
    ];
    private _mapBlockAmount: number;
    private _strMapIndex: { i: number, j: number } = null;
    private _mapBlockTagArr: number[][] = [];
    private _mapBlockNameArr: string[][] = [];

    /**
     * 生成一个随机地图对象
     * @param maxHCnt 创造地图时，地图数组最大的高度
     * @param maxWCnt 创造地图时，地图数组最大的宽度
     * @param mapBlockAmount 该随机地图包含地图块的数量, 程序保证最大值不会超过地图的宽高之积
     */
    public static instance(maxHCnt?: number, maxWCnt?: number, mapBlockAmount?: number): RandomMap {
        return new RandomMap(maxHCnt, maxWCnt, mapBlockAmount);
    }

    constructor(maxHCnt: number = 4, maxWcnt: number = 4, mapBlockAmount: number = 8) {
        this._maxHCnt = maxHCnt;
        this._maxWCnt = maxWcnt;
        this._mapBlockAmount = mapBlockAmount <= this._maxHCnt * this._maxWCnt ? mapBlockAmount : this._maxHCnt * this._maxWCnt;
    }

    /**
     * 生成地图
     * @returns 返回生成地图的地图块的名称数组。
     */
    public generator(): string[][] {
        this.generateRandBaseMap();
        this.generateMapNameArr()
        return this._mapBlockNameArr;
    }

    /**
     * 生成地图块名称数组，每块名称格式是‘01100’，分别代表上下左右和特殊地图，0表示对应方向没有出口，1表示对应方向有出口
     */
    private generateMapNameArr() {
        for (let i = 0; i < this._maxHCnt; i++) {
            this._mapBlockNameArr[i] = [];
            for (let j = 0; j < this._maxWCnt; j++) {
                this._mapBlockNameArr[i][j] = '00000';
            }
        }

        for (let i = 0; i < this._maxHCnt; i++) {
            for (let j = 0; j < this._maxWCnt; j++) {
                if (!this._mapBlockTagArr[i][j]) {
                    continue;
                }
                for (let directionIndex of this._directionArr) {
                    this.setAdjacentMapBlockName({i: i, j: j}, directionIndex);
                }
            }
        }

        this.addRandNearEmptyToMapNameArr();

    }

    /**
     * 设置相邻两个地图块之间的名称
     * @param curIndex 当前地图块的索引
     * @param directionIndex 对应方向的索引
     * @private
     */
    private setAdjacentMapBlockName(curIndex: { i: number, j: number }, directionIndex: { i: number, j: number }) {
        let adjoiningIndex = {
            i: curIndex.i + directionIndex.i,
            j: curIndex.j + directionIndex.j
        };
        if (adjoiningIndex.i >= this._maxHCnt || adjoiningIndex.j >= this._maxWCnt || adjoiningIndex.i < 0 || adjoiningIndex.j < 0) {
            return;
        }

        if (!this._mapBlockTagArr[adjoiningIndex.i][adjoiningIndex.j]) {
            return;
        }

        let curMapBlockNameArr = this._mapBlockNameArr[curIndex.i][curIndex.j].split("");
        let adjoiningMapBlockNameArr = this._mapBlockNameArr[adjoiningIndex.i][adjoiningIndex.j].split("");
        if (directionIndex.i === -1) {
            curMapBlockNameArr[0] = '1';
            adjoiningMapBlockNameArr[1] = '1';
        } else if (directionIndex.i === 1) {
            curMapBlockNameArr[1] = '1';
            adjoiningMapBlockNameArr[0] = '1';
        } else if (directionIndex.j === 1) {
            curMapBlockNameArr[3] = '1';
            adjoiningMapBlockNameArr[2] = '1';
        } else if (directionIndex.j === -1) {
            curMapBlockNameArr[2] = '1';
            adjoiningMapBlockNameArr[3] = '1';
        }
        this._mapBlockNameArr[curIndex.i][curIndex.j] = curMapBlockNameArr.join("");
        this._mapBlockNameArr[adjoiningIndex.i][adjoiningIndex.j] = adjoiningMapBlockNameArr.join("");
    }

    /**
     * 随机将一些空块连接到相邻的已命名的地图块上，不会连接两个空块。
     * @private
     */
    private addRandNearEmptyToMapNameArr() {
        for (let i = 0; i < this._maxHCnt; i++) {
            for (let j = 0; j < this._maxWCnt; j++) {
                if (this._mapBlockTagArr[i][j]) {
                    continue;
                }
                let directionIndex = this._directionArr[Math.floor(Math.random() * this._directionArr.length)];
                this.setAdjacentMapBlockName({i: i, j: j}, directionIndex);
            }
        }
    }


    //-----------------------------------------------------------
    /**
     * 生成随机的地图二维数组
     */
    private generateRandBaseMap() {
        for (let i = 0; i < this._maxHCnt; i++) {
            this._mapBlockTagArr[i] = [];
            for (let j = 0; j < this._maxWCnt; j++) {
                this._mapBlockTagArr[i][j] = 0;
            }
        }

        this._strMapIndex = {
            i: Math.floor(Math.random() * this._maxHCnt),
            j: Math.floor(Math.random() * this._maxWCnt)
        };

        let nextArr: { i: number, j: number }[] | null = this.setMap(this._strMapIndex);

        while (this._mapBlockAmount && nextArr && nextArr.length) {
            let randIndex = Math.floor(Math.random() * nextArr.length);
            let nextIndex = nextArr.splice(randIndex, 1)[0];
            let newNextArr = this.setMap(nextIndex);
            if (newNextArr) {
                nextArr = this.uniqNextArr([...newNextArr, ...nextArr]);
            }
        }
    }

    /**
     * 对地图数组取到的位置进行标记，并返回该位置的相邻数组
     * @param index 需要标记的位置的索引
     * @private
     * @returns 返回相邻数组。如果相邻数组不存在或者已经被标记，则返回null
     */
    private setMap(index: { i, j }) {
        if (index.i >= this._maxHCnt || index.j >= this._maxWCnt || index.i < 0 || index.j < 0) {
            return null;
        }
        if (this._mapBlockTagArr[index.i][index.j]) {
            return null;
        }

        this._mapBlockTagArr[index.i][index.j] = 1;
        this._mapBlockAmount--;

        if (!this._mapBlockAmount) {
            return null;
        }

        let nearArr: { i: number, j: number }[] = [];
        for (let adjoin of this._directionArr) {
            let i = adjoin.i + index.i;
            let j = adjoin.j + index.j;

            if (i >= this._maxHCnt || j >= this._maxWCnt || i < 0 || j < 0) {
                continue;
            }

            if (!this._mapBlockTagArr[i][j]) {
                nearArr.push({i: i, j: j});
            }
        }

        return nearArr;
    }

    /**
     * 对相邻数组进行去重
     * @param Arr 相邻数组
     * @private
     */
    private uniqNextArr(Arr: { i: number, j: number }[]) {
        let arr: { i: number, j: number }[] = [];
        let tag: number[] = [];
        for (let e of Arr) {
            let num = e.i + e.j * this._mapBlockAmount;
            if (!tag[num]) {
                tag[num] = 1;
                arr.push(e);
            }
        }

        return arr;
    }


}