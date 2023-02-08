const Joi = require("@hapi/joi");
const newsFeed = Joi.object().keys({
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string().required(),
  author: Joi.string().required(),
});
module.exports = newsFeed;
