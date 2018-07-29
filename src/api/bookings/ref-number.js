function generateRefNo() {
  return Math.floor(Math.random() * 90000) + 10000
};

module.exports = generateRefNo;