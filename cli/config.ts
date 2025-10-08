export default {
  host: "https://m:3000",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjY1ODk0MzIxfQ.5ZbnQjKHHc261xX4hsTfGwqkmX3iievXCNXBM6Buvh4",
  // vocabulary: ["1", "2", "3"],
  /*
  coca-4 4
  coca-5 5
  coca-6 6
  coca-2.1 7
  coca-2.2 8
  coca-3.1 9
  coca-3.2 10
  coca-3.1.1 11
  coca-3.1.6 16
  coca-3.2.1 17
  coca-3.2.6 22
  coca-2.1.1 23
  coca-2.1.5 27
  coca-2.2.1 28
  coca-2.2.6 33
  coca-4.1.1 34
  coca-4.1.5 38
  */
  vocabulary: ['10'],
  query: {
    pageSize: 20,
    pageNum: 1,
    // updatedAt: [new Date('2022-10-17T16:00:00.000Z').getTime(), new Date('2022-10-18T16:00:00.000Z').getTime()],
    // averageGrade: [0, 2.2],
    learnCount: [0, Number.MAX_SAFE_INTEGER],
    //order: JSON.stringify([["averageGrade", "ASC"], ["learnCount", "DESC"],])
    //order: JSON.stringify([["averageGrade", "ASC"], ["updatedAt", "ASC"],])
    order: JSON.stringify([["updatedAt", "ASC"]])
  },
};
