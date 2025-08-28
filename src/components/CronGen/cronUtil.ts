/**
 * 小于10得数字在前面补0
 * @param num
 */
export const zeroFill = (num: number): string =>
    num < 10 ? "0" + num : num.toString();

/**
 * 检查数字是否在范围内，若超出极限范围则返回对应得极限值
 * @param value 值
 * @param minLimit 左极限
 * @param maxLimit 右极限
 */
export const checkNumber = (
    value: number,
    minLimit: number,
    maxLimit: number
) => {
    value = Math.floor(value);
    if (value < minLimit) {
        value = minLimit;
    } else if (value > maxLimit) {
        value = maxLimit;
    }
    return value;
};
