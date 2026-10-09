const Pagination = async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const skip = (page - 1) * limit;

  req.Pagination = {
    page,
    limit,
    skip,
  };

  next();
};

export default Pagination;
