// Copyright 2019 StoneHui.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/*
 * Create by StoneHui on 2019/02/26.
 * 
 * 游戏摇杆组件（全方向、四方向、八方向、跟随模式）。
 */


// 摇杆类型。
const Type = cc.Enum({
    ALL: -1,
    FOUR: -1,
    EIGHT: -1,
});

// 摇杆组件。
module.exports = cc.Class({

    extends: cc.Component,

    properties: {

        type: {
            type: Type,
            default: Type.ALL,
        },

    	rocker: {
    		type: cc.Node,
    		default: null,
    	},

        isFollow: false,

    	maxRadius: 80,

    },

    start () {

        // 记录摇杆的初始坐标，方便移动后恢复初始位置。
        this.originPosition = cc.v2(this.node.getPosition().x, this.node.getPosition().y);

    	this._setRockerPositionAndCalcDirection(cc.v2(0, 0));

    	this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
    	this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
    	this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    	this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);

    },

    update (dt) {
    },

    // 设置摇杆的类型。
    setType(type) {

        if (Type.hasOwnProperty(type)) {
            this.type = type;
        } else {
            throw 'type 参数的值必须是枚举类 RockerType 的实例。';
        }

    },

    // 设置为全方向。
    setTypeAsAll () {

        this.setType(Type.ALL);

    },

    // 设置为四方向。
    setTypeAsFour () {

        this.setType(Type.FOUR);

    },

    // 设置为八方向。
    setTypeAsEight () {

        this.setType(Type.EIGHT);

    },

    // 设置是否使用跟随模式。
    setFollow (isFollow) {

        this.isFollow = isFollow;

    },

    // 切换是否跟随。
    toggleFollow (toggle) {

        this.setFollow(toggle.isChecked);

    },

    _onTouchStart (event) {

        this._setRockerPositionAndCalcDirection(this.node.convertToNodeSpaceAR(event.getLocation()));

    },

    _onTouchMove (event) {

        var location = event.getLocation();

        // 转换成当前节点的坐标体系的坐标。
        var position = this.node.convertToNodeSpaceAR(location);
        var distance = position.mag();
        if (distance > this.maxRadius) {
            position = cc.v2(position.x / distance * this.maxRadius, position.y / distance * this.maxRadius);
        }
        this._setRockerPositionAndCalcDirection(position);

        // 转换成当前节点父节点的坐标体系的坐标。
        position = this.node.parent.convertToNodeSpaceAR(location);
        distance = position.sub(this.node.getPosition()).mag();
        if (this.isFollow && distance > this.maxRadius) {
            var rate = this.maxRadius / distance;
            this.node.x = position.x - (position.x - this.node.x) * rate;
            this.node.y = position.y - (position.y - this.node.y) * rate;
        }

    },

    _onTouchEnd (event) {
        
        this._setRockerPositionAndCalcDirection(cc.v2(0, 0));
        this.node.setPosition(cc.v2(this.originPosition.x, this.originPosition.y));

    },

    _onTouchCancel (event) {
        
        this._setRockerPositionAndCalcDirection(cc.v2(0, 0));
        this.node.setPosition(cc.v2(this.originPosition.x, this.originPosition.y));

    },

    // 设置控制点的位置，并计算移动方向。
    _setRockerPositionAndCalcDirection (position) {

    	this.rocker.position = position;

    	this._calcDirection(position);

    },

    // 计算移动方向。
    _calcDirection (position) {

        var distance = position.mag();
        
        if (distance == 0) {
            this.direction = cc.v2(0, 0);
            return;
        }
        switch(this.type) {
            case Type.ALL: // 所有方向
                this.direction = cc.v2(position.x / distance, position.y / distance);
                break;
            case Type.FOUR: // 四方向
                if (position.x <= position.y) {
                    if (-position.x <= position.y) {
                        this.direction = cc.v2(0, 1); // 上
                    } else {
                        this.direction = cc.v2(-1, 0); // 左
                    }
                } else {
                    if (-position.x >= position.y) {
                        this.direction = cc.v2(0, -1); // 下
                    } else {
                        this.direction = cc.v2(1, 0); // 右
                    }
                }
                break;
            case Type.EIGHT: // 八方向
                var oneEighthPI = Math.PI / 8;
                var radian = Math.atan2(position.y, position.x);
                if (radian >= 0) {
                    if (radian <= oneEighthPI) {
                        this.direction = cc.v2(1, 0); // 右
                    } else if (radian <= oneEighthPI * 3) {
                        this.direction = cc.v2(1 / Math.sqrt(2), 1 / Math.sqrt(2)); // 右上
                    } else if (radian <= oneEighthPI * 5) {
                        this.direction = cc.v2(0, 1); // 上
                    } else if (radian <= oneEighthPI * 7) {
                        this.direction = cc.v2(-1 / Math.sqrt(2), 1 / Math.sqrt(2)); // 左上
                    } else {
                        this.direction = cc.v2(-1, 0); // 左
                    }
                } else {
                    if (radian >= -oneEighthPI) {
                        this.direction = cc.v2(1, 0); // 右
                    } else if (radian >= -oneEighthPI * 3) {
                        this.direction = cc.v2(1 / Math.sqrt(2), -1 / Math.sqrt(2)); // 右下
                    } else if (radian >= -oneEighthPI * 5) {
                        this.direction = cc.v2(0, -1); // 下
                    } else if (radian >= -oneEighthPI * 7) {
                        this.direction = cc.v2(-1 / Math.sqrt(2), -1 / Math.sqrt(2)); // 左下
                    } else {
                        this.direction = cc.v2(-1, 0); // 左
                    }
                }
                break;
        }

    },

    // 获取移动方向（向量）。
    getDirection () {

    	return this.direction;

    },

});

module.exports.Type = Type;
