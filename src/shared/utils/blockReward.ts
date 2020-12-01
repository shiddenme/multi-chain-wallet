

// 获取普通区块奖励。 从0开始，每250万个区块后减半。
export function getConstReward(height) {
    const year = 2500000
    let n = Math.ceil((height + 1) / year)
    return 20 * Math.pow((1 / 2), n - 1)
}

export function getFoundationPercent(height){
    const year = 2500000
    let n = Math.ceil((height + 1) / year)

    return (0.05 * Math.pow((1 / 2), n - 1));
}


// 包含叔块的奖励,最多两个叔块
export function getRewardForUncle(height, uncleNumber) {
    let reward = getConstReward(height);
    return (reward / 32) * uncleNumber;
}

// 获取叔块奖励,uHeight为叔块高度，height为包含区块高度, constReward为固定奖励
export function getUncleReward(uHeight, height, constReward) {
    let reward = (uHeight + 8 - height) * constReward / 8;
    return reward
}

