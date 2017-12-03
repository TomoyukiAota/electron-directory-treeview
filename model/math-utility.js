/**
 * Returns the mean of numbers.
 * @param {*} numbers Array of numbers
 */
exports.mean = function (numbers) {
  const sum = numbers.reduce((previous, current) => current += previous, 0);
  return sum / numbers.length;
}