const todayPage = 1

/**
 * @typedef {{
 * id: number;
 * text: string;
 * averageGrade: number;
 * learnCount: number;
 * lastGrade: number;
 * lastTime: string | null;
 * createdAt: string;
 * userId: number;
 * }} WordRecord
 * 
 * @type {{
 * pageNumber: number;
 * pageSize: number;
 * onlyUnfamiliar: boolean;
 * globalOrder: { key: keyof WordRecord; asc: boolean; };
 * inPageOrder: { key: keyof WordRecord; asc: boolean; };
 * }}
 */
const cfg = {
  pageNumber: todayPage,
  pageSize: 600,
  onlyUnfamiliar: true,
  globalOrder: {
    key: "text",
    asc: true
  },
  inPageOrder: {
    key: "text",
    asc: true
  }
}
/**
 * @type {typeof cfg}
 */
const cfg2 = {
  //pageNumber: 2,pageSize: 3600,
  pageNumber: 16, pageSize: 600,
  onlyUnfamiliar: true,
  globalOrder: {
    key: "text",
    asc: true
  },
  inPageOrder: {
    key: "averageGrade",
    asc: true
  }
}
export default cfg2
