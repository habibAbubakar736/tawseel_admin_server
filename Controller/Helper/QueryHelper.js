
const pool = require("../../Config/db_pool");

exports.PaginationQuery = async (query_count, query, cond, limit, page) => {
  limit = (limit === "" || !limit) ? 20 : Number(limit);
  page = (page === "" || !page) ? 1 : Number(page);

  let total_records = 0;
  let total_pages = 0;
  let next = true;
  let prev = true;
  const start = (page - 1) * limit;

  try {
    const [[totalCount]] = await pool.query(query_count, cond);
    total_records = totalCount.total_records;
    total_pages = Math.ceil(total_records / limit);
    cond.push(start);
    cond.push(limit);
    const [dataRows] = await pool.query(query, cond);
    next = page < total_pages;
    prev = page > 1;

    return {
      success: true,
      total_records,
      total_pages,
      page,
      next,
      prev,
      data: dataRows,
    };
  } catch (error) {
    throw new Error(`Pagination query failed: ${error.message}`);
  }



  // const pool = require("../../Config/db_pool");

  // exports.PaginationQuery = async (query_count, query, cond, limit, page) => {
  //   var limit = (limit === "" || !limit) ? 20 : Number(limit);
  //   var page = (page === "" || !page) ? 1 : Number(page);
  //   var total_pages = 0;
  //   var total_records = 0;
  //   var next = true;
  //   var prev = true;
  //   var start = (page - 1) * limit;

  //   try {
  //     var [[totalCount]] = await pool.query(query_count, cond);
  //     total_records = totalCount.total_records;

  //     cond.push(start);
  //     cond.push(limit);

  //     var [dataRows] = await pool.query(query, cond);
  //     var next = page >= total_pages ? false : true;
  //     var prev = page <= 1 ? false : true;
  //     total_pages = Math.ceil(total_records / limit);

  //     return { success: true, total_records, total_pages, page, next, prev, data: dataRows, };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
};
