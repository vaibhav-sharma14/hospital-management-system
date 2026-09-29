// Shared pagination + search + filter helper used across controllers
const paginate = async (model, req, options = {}) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const filter = options.baseFilter ? { ...options.baseFilter } : {};

  // Generic search across provided fields
  if (req.query.search && options.searchFields?.length) {
    filter.$or = options.searchFields.map((field) => ({
      [field]: { $regex: req.query.search, $options: 'i' },
    }));
  }

  // Generic exact-match filters (e.g. status, department, role)
  if (options.filterFields?.length) {
    options.filterFields.forEach((field) => {
      if (req.query[field]) filter[field] = req.query[field];
    });
  }

  const sort = req.query.sort ? req.query.sort.replace(',', ' ') : '-createdAt';

  const [data, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit).populate(options.populate || []),
    model.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    },
  };
};

module.exports = paginate;
